import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const globalSettingsTable = pgTable("global_settings", {
  id: serial("id").primaryKey(),
  globalPassword: text("global_password"),
  defaultProxy: text("default_proxy"),
  defaultAiMode: text("default_ai_mode").notNull().default("ollama"),
  defaultModelName: text("default_model_name"),
  language: text("language").notNull().default("ru"),
});

export const insertGlobalSettingsSchema = createInsertSchema(globalSettingsTable).omit({ id: true });
export type InsertGlobalSettings = z.infer<typeof insertGlobalSettingsSchema>;
export type GlobalSettings = typeof globalSettingsTable.$inferSelect;
