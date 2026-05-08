import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, botsTable, chatMessagesTable } from "@workspace/db";
import {
  CreateBotBody,
  GetBotParams,
  UpdateBotParams,
  UpdateBotBody,
  DeleteBotParams,
  ConnectBotParams,
  DisconnectBotParams,
  BotActionParams,
  BotActionBody,
  GetBotMessagesParams,
  GetBotMessagesQueryParams,
  SendBotMessageParams,
  SendBotMessageBody,
  ListBotsResponse,
  GetBotResponse,
  UpdateBotResponse,
  ConnectBotResponse,
  DisconnectBotResponse,
  BotActionResponse,
  GetBotMessagesResponse,
  SendBotMessageResponse,
} from "@workspace/api-zod";
import {
  connectBot,
  disconnectBot,
  sendBotChat,
  stopBotAction,
  stopBotMovement,
  startSurvivorMode,
  getAiResponse,
} from "../lib/mineflayer";

const router: IRouter = Router();

router.get("/bots", async (req, res): Promise<void> => {
  const bots = await db.select().from(botsTable).orderBy(desc(botsTable.createdAt));
  res.json(ListBotsResponse.parse(bots));
});

router.post("/bots", async (req, res): Promise<void> => {
  const parsed = CreateBotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [bot] = await db.insert(botsTable).values({
    name: data.name,
    serverHost: data.serverHost,
    serverPort: data.serverPort ?? 25565,
    version: data.version ?? "1.20.1",
    aiMode: data.aiMode ?? "ollama",
    modelName: data.modelName ?? null,
    apiKey: data.apiKey ?? null,
    systemPrompt: data.systemPrompt ?? null,
    autoReply: data.autoReply ?? false,
    autoLogin: data.autoLogin ?? false,
    proxyHost: data.proxyHost ?? null,
    proxyPort: data.proxyPort ?? null,
    proxyType: data.proxyType ?? null,
    proxyUser: data.proxyUser ?? null,
    useAi: data.useAi ?? true,
  }).returning();
  res.status(201).json(GetBotResponse.parse(bot));
});

router.get("/bots/:id", async (req, res): Promise<void> => {
  const params = GetBotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, params.data.id));
  if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
  res.json(GetBotResponse.parse(bot));
});

router.put("/bots/:id", async (req, res): Promise<void> => {
  const params = UpdateBotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBotBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Partial<typeof botsTable.$inferInsert> = {};
  const d = parsed.data;
  if (d.name !== undefined) updateData.name = d.name;
  if (d.serverHost !== undefined) updateData.serverHost = d.serverHost;
  if (d.serverPort !== undefined) updateData.serverPort = d.serverPort;
  if (d.version !== undefined) updateData.version = d.version;
  if (d.aiMode !== undefined) updateData.aiMode = d.aiMode;
  if (d.modelName !== undefined) updateData.modelName = d.modelName ?? null;
  if (d.apiKey !== undefined) updateData.apiKey = d.apiKey ?? null;
  if (d.systemPrompt !== undefined) updateData.systemPrompt = d.systemPrompt ?? null;
  if (d.autoReply !== undefined) updateData.autoReply = d.autoReply;
  if (d.autoLogin !== undefined) updateData.autoLogin = d.autoLogin;
  if (d.proxyHost !== undefined) updateData.proxyHost = d.proxyHost ?? null;
  if (d.proxyPort !== undefined) updateData.proxyPort = d.proxyPort ?? null;
  if (d.proxyType !== undefined) updateData.proxyType = d.proxyType ?? null;
  if (d.proxyUser !== undefined) updateData.proxyUser = d.proxyUser ?? null;
  if (d.useAi !== undefined) updateData.useAi = d.useAi;

  const [bot] = await db.update(botsTable).set(updateData).where(eq(botsTable.id, params.data.id)).returning();
  if (!bot) { res.status(404).json({ error: "Bot not found" }); return; }
  res.json(UpdateBotResponse.parse(bot));
});

router.delete("/bots/:id", async (req, res): Promise<void> => {
  const params = DeleteBotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await disconnectBot(params.data.id).catch(() => {});
  await db.delete(botsTable).where(eq(botsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/bots/:id/connect", async (req, res): Promise<void> => {
  const params = ConnectBotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const result = await connectBot(params.data.id);
  res.json(ConnectBotResponse.parse(result));
});

router.post("/bots/:id/disconnect", async (req, res): Promise<void> => {
  const params = DisconnectBotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const result = await disconnectBot(params.data.id);
  res.json(DisconnectBotResponse.parse(result));
});

router.post("/bots/:id/action", async (req, res): Promise<void> => {
  const params = BotActionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = BotActionBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const { action, value } = body.data;
  let result: { success: boolean; message: string };

  switch (action) {
    case "stop":
      result = await stopBotAction(params.data.id);
      break;
    case "stop_movement":
      result = await stopBotMovement(params.data.id);
      break;
    case "survivor_mode":
      result = await startSurvivorMode(params.data.id);
      break;
    case "rename":
      if (value) {
        await db.update(botsTable).set({ name: value }).where(eq(botsTable.id, params.data.id));
        result = { success: true, message: `Bot renamed to ${value}` };
      } else {
        result = { success: false, message: "Name is required" };
      }
      break;
    default:
      result = { success: false, message: "Unknown action" };
  }

  res.json(BotActionResponse.parse(result));
});

router.get("/bots/:id/messages", async (req, res): Promise<void> => {
  const params = GetBotMessagesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const query = GetBotMessagesQueryParams.safeParse(req.query);
  const limit = query.success && query.data.limit ? Number(query.data.limit) : 100;

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.botId, params.data.id))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(limit);

  res.json(GetBotMessagesResponse.parse(messages.reverse()));
});

router.post("/bots/:id/messages", async (req, res): Promise<void> => {
  const params = SendBotMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = SendBotMessageBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  const [botConfig] = await db.select().from(botsTable).where(eq(botsTable.id, params.data.id));
  if (!botConfig) { res.status(404).json({ error: "Bot not found" }); return; }

  const { content, useAi } = body.data;

  if (botConfig.status === "online" || botConfig.status === "autonomous") {
    const result = await sendBotChat(params.data.id, content);
    res.json(SendBotMessageResponse.parse(result));
  } else if (useAi && botConfig.useAi) {
    // Offline AI chat
    await db.insert(chatMessagesTable).values({
      botId: params.data.id,
      content,
      sender: "user",
      type: "chat",
    });
    const aiReply = await getAiResponse(botConfig, content);
    if (aiReply) {
      await db.insert(chatMessagesTable).values({
        botId: params.data.id,
        content: aiReply,
        sender: "AI",
        type: "ai",
      });
    }
    res.json(SendBotMessageResponse.parse({ success: true, message: aiReply ?? "No response" }));
  } else {
    await db.insert(chatMessagesTable).values({
      botId: params.data.id,
      content,
      sender: "user",
      type: "chat",
    });
    res.json(SendBotMessageResponse.parse({ success: true, message: "Message saved" }));
  }
});

router.get("/stats", async (_req, res): Promise<void> => {
  const bots = await db.select().from(botsTable);
  const stats = {
    totalBots: bots.length,
    onlineBots: bots.filter((b) => b.status === "online").length,
    autonomousBots: bots.filter((b) => b.status === "autonomous").length,
    botsWithAi: bots.filter((b) => b.useAi).length,
  };
  res.json(stats);
});

export default router;
