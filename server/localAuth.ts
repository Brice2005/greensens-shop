import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { authSessions, users, type User } from "../drizzle/schema";
import { getDb } from "./db";

const scrypt = promisify(scryptCallback);
export const LOCAL_SESSION_COOKIE = "greensens_session";
const SESSION_DAYS = 30;
const secureSession = process.env.NODE_ENV === "production" || Boolean(process.env.MANUS_PROJECT_ID);
const sessionSameSite = secureSession ? "none" as const : "lax" as const;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
function readCookie(req: Request, name: string) { return req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1); }

export async function createLocalSession(userId: number, res: Response) {
  const database = await getDb();
  if (!database) throw new Error("PostgreSQL n’est pas configuré");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await database.insert(authSessions).values({ tokenHash: tokenHash(token), userId, expiresAt });
  res.cookie(LOCAL_SESSION_COOKIE, token, { httpOnly: true, sameSite: sessionSameSite, secure: secureSession, expires: expiresAt, path: "/" });
}

export async function getLocalUser(req: Request): Promise<User | null> {
  const token = readCookie(req, LOCAL_SESSION_COOKIE);
  if (!token) return null;
  const database = await getDb();
  if (!database) return null;
  const result = await database.select({ user: users }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.tokenHash, tokenHash(token)), gt(authSessions.expiresAt, new Date()))).limit(1);
  return result[0]?.user ?? null;
}

export async function destroyLocalSession(req: Request, res: Response) {
  const token = readCookie(req, LOCAL_SESSION_COOKIE);
  const database = await getDb();
  if (token && database) await database.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash(token)));
  res.clearCookie(LOCAL_SESSION_COOKIE, { httpOnly: true, sameSite: sessionSameSite, secure: secureSession, path: "/" });
}
