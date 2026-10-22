import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["client", "seller", "admin"]);
export const orderStatus = pgEnum("order_status", ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]);
export const requestStatus = pgEnum("request_status", ["pending", "approved", "rejected"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 160 }),
  email: varchar("email", { length: 320 }),
  passwordHash: text("password_hash"),
  role: userRole("role").default("client").notNull(),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: serial("id").primaryKey(),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  farmName: varchar("farm_name", { length: 180 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 160 }),
  transportPricePerKg: numeric("transport_price_per_kg", { precision: 12, scale: 2 }).default("0").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => sellerProfiles.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  description: text("description"),
  origin: varchar("origin", { length: 160 }),
  pricePerKg: numeric("price_per_kg", { precision: 12, scale: 2 }).notNull(),
  stockKg: integer("stock_kg").default(0).notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sellerRequests = pgTable("seller_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  farmName: varchar("farm_name", { length: 180 }).notNull(),
  location: varchar("location", { length: 160 }),
  message: text("message"),
  status: requestStatus("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => users.id),
  status: orderStatus("status").default("pending").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  customerName: varchar("customer_name", { length: 160 }),
  customerPhone: varchar("customer_phone", { length: 40 }),
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantityKg: integer("quantity_kg").notNull(),
  pricePerKg: numeric("price_per_kg", { precision: 12, scale: 2 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type SellerProfile = typeof sellerProfiles.$inferSelect;
