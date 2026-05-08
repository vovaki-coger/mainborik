import { Router, type IRouter } from "express";
import { db, globalSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody, GetSettingsResponse, UpdateSettingsResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const existing = await db.select().from(globalSettingsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(globalSettingsTable).values({
    defaultAiMode: "ollama",
    language: "ru",
  }).returning();
  return created;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(GetSettingsResponse.parse(settings));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const settings = await getOrCreateSettings();
  const updateData: Partial<typeof globalSettingsTable.$inferInsert> = {};
  const d = parsed.data;

  if (d.globalPassword !== undefined) updateData.globalPassword = d.globalPassword ?? null;
  if (d.defaultProxy !== undefined) updateData.defaultProxy = d.defaultProxy ?? null;
  if (d.defaultAiMode !== undefined) updateData.defaultAiMode = d.defaultAiMode;
  if (d.defaultModelName !== undefined) updateData.defaultModelName = d.defaultModelName ?? null;
  if (d.language !== undefined) updateData.language = d.language;

  const [updated] = await db.update(globalSettingsTable)
    .set(updateData)
    .where(eq(globalSettingsTable.id, settings!.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(updated ?? settings));
});

export default router;
