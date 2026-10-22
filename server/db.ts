import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { users, type User } from "../drizzle/schema";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  const connectionString = process.env.PG_DATABASE_URL;
  if (!connectionString) return null;
  if (!pool) {
    pool = new Pool({ connectionString, max: 5, ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false } });
    pool.on("error", (error: Error) => console.error("[PostgreSQL] pool error", error));
  }
  if (!db) db = drizzle(pool);
  return db;
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const database = await getDb();
  if (!database) return undefined;
  const result = await database.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function upsertUser(input: {
  openId: string;
  name?: string | null;
  email?: string | null;
  role?: "client" | "seller" | "admin";
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  const database = await getDb();
  if (!database) return;
  await database.insert(users).values({ openId: input.openId, name: input.name, email: input.email, role: input.role ?? "client" }).onConflictDoUpdate({ target: users.openId, set: { name: input.name, email: input.email, updatedAt: new Date() } });
}
