import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "./db";
import { orderItems, orders, products, sellerProfiles, users } from "../drizzle/schema";
import { createLocalSession, destroyLocalSession, hashPassword, verifyPassword } from "./localAuth";
import { randomUUID } from "node:crypto";

export const appRouter = router({
  system: router({ health: publicProcedure.query(() => ({ ok: true, database: Boolean(process.env.PG_DATABASE_URL) })) }),
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    register: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), phone: z.string().min(6), address: z.string().min(5), role: z.enum(["client", "seller"]).default("client") })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("PostgreSQL n’est pas configuré. Vérifie PG_DATABASE_URL.");
      const existing = await database.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
      if (existing[0]) throw new Error("Cette adresse e-mail est déjà utilisée.");
      const [user] = await database.insert(users).values({ openId: `local:${randomUUID()}`, name: input.name, email: input.email.toLowerCase(), passwordHash: await hashPassword(input.password), phone: input.phone, address: input.address, role: input.role }).returning();
      if (input.role === "seller") await database.insert(sellerProfiles).values({ userId: user.id, slug: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomUUID().slice(0, 8)}`, farmName: input.name, location: "Sénégal", transportPricePerKg: "0" });
      await createLocalSession(user.id, ctx.res);
      return { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role };
    }),
    login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1), admin: z.boolean().default(false) })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("PostgreSQL n’est pas configuré. Vérifie PG_DATABASE_URL.");
      const [user] = await database.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
      if (!user || !(await verifyPassword(input.password, user.passwordHash)) || (input.admin && user.role !== "admin")) throw new Error("E-mail, mot de passe ou rôle incorrect.");
      await createLocalSession(user.id, ctx.res);
      return { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role };
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await destroyLocalSession(ctx.req, ctx.res);
      ctx.res.clearCookie("webdev_app_session", { httpOnly: true, sameSite: "none", secure: true, maxAge: 0 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.input(z.object({ search: z.string().optional(), category: z.string().optional() }).optional()).query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      return database.select().from(products).where(eq(products.active, true));
    }),
  }),
  orders: router({
    create: protectedProcedure.input(z.object({ customerName: z.string().min(2), customerPhone: z.string().min(6), deliveryAddress: z.string().min(5), items: z.array(z.object({ productId: z.number().int(), quantityKg: z.number().int().min(10), pricePerKg: z.number().nonnegative(), transportPricePerKg: z.number().nonnegative() })).min(1) })).mutation(async ({ input, ctx }) => {
      const total = input.items.reduce((sum, item) => sum + item.quantityKg * (item.pricePerKg + item.transportPricePerKg), 0);
      const database = await getDb();
      if (!database) return { id: `demo-${Date.now()}`, total, sentToSeller: true, customer: { name: input.customerName, phone: input.customerPhone, address: input.deliveryAddress } };
      const [order] = await database.insert(orders).values({ customerId: ctx.user.id, customerName: input.customerName, customerPhone: input.customerPhone, deliveryAddress: input.deliveryAddress, total: total.toFixed(2) }).returning({ id: orders.id });
      await database.insert(orderItems).values(input.items.map(item => ({ orderId: order.id, productId: item.productId, quantityKg: item.quantityKg, pricePerKg: (item.pricePerKg + item.transportPricePerKg).toFixed(2) })));
      return { id: order.id, total, sentToSeller: true, customer: { name: input.customerName, phone: input.customerPhone, address: input.deliveryAddress } };
    }),
  }),
  seller: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const [profile] = await database.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1);
      return profile ?? null;
    }),
    updateTransport: protectedProcedure.input(z.object({ sellerProfileId: z.number().int(), transportPricePerKg: z.number().nonnegative() })).mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return { ok: true, demo: true };
      await database.update(sellerProfiles).set({ transportPricePerKg: input.transportPricePerKg.toFixed(2) }).where(and(eq(sellerProfiles.id, input.sellerProfileId), eq(sellerProfiles.userId, ctx.user.id)));
      return { ok: true, demo: false, userId: ctx.user.id };
    }),
  }),
});

export type AppRouter = typeof appRouter;
