import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botsTable = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  serverHost: text("server_host").notNull(),
  serverPort: integer("server_port").notNull().default(25565),
  version: text("version").notNull().default("1.20.1"),
  status: text("status").notNull().default("offline"),
  hp: real("hp"),
  hunger: real("hunger"),
  xp: real("xp"),
  armor: real("armor"),
  posX: real("pos_x"),
  posY: real("pos_y"),
  posZ: real("pos_z"),
  biome: text("biome"),
  inventory: text("inventory"),
  aiMode: text("ai_mode").notNull().default("ollama"),
  modelName: text("model_name"),
  apiKey: text("api_key"),
  systemPrompt: text("system_prompt"),
  autoReply: boolean("auto_reply").notNull().default(false),
  autoLogin: boolean("auto_login").notNull().default(false),
  proxyHost: text("proxy_host"),
  proxyPort: integer("proxy_port"),
  proxyType: text("proxy_type"),
  proxyUser: text("proxy_user"),
  useAi: boolean("use_ai").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBotSchema = createInsertSchema(botsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof botsTable.$inferSelect;
