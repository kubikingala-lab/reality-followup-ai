import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const companyProfiles = mysqlTable("company_profiles", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("companyName", { length: 160 }).notNull().default("Domov Reality"),
  logoUrl: text("logoUrl"),
  logoKey: varchar("logoKey", { length: 512 }),
  primaryColor: varchar("primaryColor", { length: 16 }).notNull().default("#C66A3D"),
  senderName: varchar("senderName", { length: 160 }).notNull().default("Realitní tým"),
  senderEmail: varchar("senderEmail", { length: 320 }),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  resendApiKey: varchar("resendApiKey", { length: 512 }),
  googleCalendarToken: text("googleCalendarToken"),
  googleCalendarConnected: boolean("googleCalendarConnected").notNull().default(false),
  licenseKey: varchar("licenseKey", { length: 1024 }).notNull(),
  licensedCustomerId: varchar("licensedCustomerId", { length: 255 }),
  licensedCustomerName: varchar("licensedCustomerName", { length: 255 }),
  licensedCustomerEmail: varchar("licensedCustomerEmail", { length: 320 }),
  licenseExpiresAt: timestamp("licenseExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  ownerIdx: uniqueIndex("company_profiles_owner_idx").on(table.ownerId),
  cronIdx: index("company_profiles_cron_idx").on(table.scheduleCronTaskUid),
}));

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  propertyType: varchar("propertyType", { length: 140 }).notNull(),
  budget: varchar("budget", { length: 140 }).notNull(),
  lookingFor: text("lookingFor").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "answered", "qualified", "meeting_scheduled", "lost"]).notNull().default("new"),
  isDemo: boolean("isDemo").notNull().default(false),
  clientRepliedAt: timestamp("clientRepliedAt"),
  lastOutboundAt: timestamp("lastOutboundAt"),
  followUpStartedAt: timestamp("followUpStartedAt"),
  followUp1SentAt: timestamp("followUp1SentAt"),
  followUp3SentAt: timestamp("followUp3SentAt"),
  followUp7SentAt: timestamp("followUp7SentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  ownerIdx: index("leads_owner_idx").on(table.ownerId),
  statusIdx: index("leads_status_idx").on(table.status),
  followUpIdx: index("leads_followup_idx").on(table.clientRepliedAt, table.lastOutboundAt),
}));

export const communications = mysqlTable("communications", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  leadId: int("leadId").notNull().references(() => leads.id, { onDelete: "cascade" }),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  kind: mysqlEnum("kind", ["initial_reply", "follow_up", "manual", "note"]).notNull(),
  subject: varchar("subject", { length: 240 }),
  body: text("body").notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", ["draft", "sent", "failed", "received"]).notNull(),
  followUpDay: int("followUpDay"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  leadIdx: index("communications_lead_idx").on(table.leadId, table.createdAt),
  ownerIdx: index("communications_owner_idx").on(table.ownerId),
}));

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = typeof companyProfiles.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;
