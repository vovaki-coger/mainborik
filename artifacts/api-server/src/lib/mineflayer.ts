import mineflayer from "mineflayer";
import { WebSocket } from "ws";
import { db, botsTable, chatMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

interface BotInstance {
  bot: ReturnType<typeof mineflayer.createBot>;
  id: number;
}

const activeBots = new Map<number, BotInstance>();
const wsClients = new Set<WebSocket>();

export function registerWsClient(ws: WebSocket) {
  wsClients.add(ws);
  ws.on("close", () => wsClients.delete(ws));
}

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  for (const ws of wsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

async function updateBotState(id: number, state: Partial<typeof botsTable.$inferInsert>) {
  await db.update(botsTable).set(state).where(eq(botsTable.id, id));
  broadcast({ type: "bot_update", botId: id, state });
}

async function saveMessage(botId: number, content: string, sender: string, type: string) {
  await db.insert(chatMessagesTable).values({ botId, content, sender, type });
  broadcast({ type: "chat_message", botId, content, sender, msgType: type });
}

export async function connectBot(botId: number): Promise<{ success: boolean; message: string }> {
  if (activeBots.has(botId)) {
    return { success: false, message: "Bot is already connected" };
  }

  const [botConfig] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
  if (!botConfig) {
    return { success: false, message: "Bot not found" };
  }

  await updateBotState(botId, { status: "connecting" });

  try {
    const botOptions: Parameters<typeof mineflayer.createBot>[0] = {
      host: botConfig.serverHost,
      port: botConfig.serverPort,
      username: botConfig.name,
      version: botConfig.version,
      auth: "offline",
    };

    const bot = mineflayer.createBot(botOptions);

    bot.on("login", async () => {
      logger.info({ botId }, "Bot logged in");
      await updateBotState(botId, {
        status: "online",
        hp: bot.health,
        hunger: bot.food,
        xp: bot.experience?.level ?? 0,
      });
      await saveMessage(botId, "Bot connected to server", "system", "system");
    });

    bot.on("health", async () => {
      await updateBotState(botId, {
        hp: bot.health,
        hunger: bot.food,
      });
    });

    bot.on("experience", async () => {
      await updateBotState(botId, {
        xp: bot.experience?.level ?? 0,
      });
    });

    bot.on("move", async () => {
      const pos = bot.entity?.position;
      if (pos) {
        await updateBotState(botId, {
          posX: pos.x,
          posY: pos.y,
          posZ: pos.z,
        });
      }
    });

    bot.on("chat", async (username: string, message: string) => {
      if (username === botConfig.name) return;
      await saveMessage(botId, message, username, "chat");

      const freshConfig = await db.select().from(botsTable).where(eq(botsTable.id, botId));
      if (freshConfig[0]?.autoReply && freshConfig[0]?.useAi) {
        const aiReply = await getAiResponse(freshConfig[0], `${username}: ${message}`);
        if (aiReply) {
          bot.chat(aiReply);
          await saveMessage(botId, aiReply, botConfig.name, "bot");
        }
      }
    });

    bot.on("kicked", async (reason: string) => {
      logger.info({ botId, reason }, "Bot was kicked");
      await updateBotState(botId, { status: "offline" });
      await saveMessage(botId, `Kicked: ${reason}`, "system", "system");
      activeBots.delete(botId);
    });

    bot.on("error", async (err: Error) => {
      logger.error({ botId, err }, "Bot error");
      await updateBotState(botId, { status: "error" });
      activeBots.delete(botId);
    });

    bot.on("end", async () => {
      logger.info({ botId }, "Bot disconnected");
      await updateBotState(botId, { status: "offline" });
      activeBots.delete(botId);
    });

    activeBots.set(botId, { bot, id: botId });
    return { success: true, message: "Connecting to server..." };
  } catch (err) {
    logger.error({ botId, err }, "Failed to create bot");
    await updateBotState(botId, { status: "error" });
    return { success: false, message: String(err) };
  }
}

export async function disconnectBot(botId: number): Promise<{ success: boolean; message: string }> {
  const instance = activeBots.get(botId);
  if (!instance) {
    await updateBotState(botId, { status: "offline" });
    return { success: true, message: "Bot was not connected" };
  }
  instance.bot.quit();
  activeBots.delete(botId);
  await updateBotState(botId, { status: "offline" });
  return { success: true, message: "Bot disconnected" };
}

export async function sendBotChat(botId: number, message: string): Promise<{ success: boolean; message: string }> {
  const instance = activeBots.get(botId);
  if (!instance) {
    return { success: false, message: "Bot is not connected" };
  }
  instance.bot.chat(message);
  const [botConfig] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
  await saveMessage(botId, message, botConfig?.name ?? "bot", "bot");
  return { success: true, message: "Message sent" };
}

export async function stopBotAction(botId: number): Promise<{ success: boolean; message: string }> {
  const instance = activeBots.get(botId);
  if (!instance) return { success: false, message: "Bot is not connected" };
  try {
    const pathfinder = (instance.bot as any).pathfinder;
    if (pathfinder) pathfinder.stop();
  } catch {
    // pathfinder may not be loaded
  }
  await saveMessage(botId, "Action stopped", "system", "system");
  return { success: true, message: "Action stopped" };
}

export async function stopBotMovement(botId: number): Promise<{ success: boolean; message: string }> {
  const instance = activeBots.get(botId);
  if (!instance) return { success: false, message: "Bot is not connected" };
  instance.bot.clearControlStates();
  await saveMessage(botId, "Movement stopped", "system", "system");
  return { success: true, message: "Movement stopped" };
}

export async function startSurvivorMode(botId: number): Promise<{ success: boolean; message: string }> {
  const instance = activeBots.get(botId);
  if (!instance) return { success: false, message: "Bot is not connected" };

  await updateBotState(botId, { status: "autonomous" });
  await saveMessage(botId, "Survivor mode activated — AI is now controlling the bot", "system", "system");

  runSurvivorLoop(botId, instance.bot).catch((err) => {
    logger.error({ botId, err }, "Survivor mode error");
  });

  return { success: true, message: "Survivor mode activated" };
}

async function runSurvivorLoop(botId: number, bot: ReturnType<typeof mineflayer.createBot>) {
  const [config] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
  if (!config) return;

  const context = buildBotContext(bot, config);
  const aiResponse = await getAiResponse(config, context);

  if (aiResponse) {
    await saveMessage(botId, `AI decision: ${aiResponse}`, "system", "system");
    try {
      const cmd = JSON.parse(aiResponse);
      if (cmd.action === "attack" && cmd.target) {
        const entity = bot.nearestEntity((e) => e.name === cmd.target || e.username === cmd.target);
        if (entity) bot.attack(entity);
      } else if (cmd.action === "chat" && cmd.message) {
        bot.chat(cmd.message);
      } else if (cmd.action === "look") {
        await bot.look(cmd.yaw ?? 0, cmd.pitch ?? 0, true);
      }
    } catch {
      // not valid JSON — treat as chat
      if (aiResponse.length < 256) bot.chat(aiResponse);
    }
  }
}

function buildBotContext(bot: ReturnType<typeof mineflayer.createBot>, config: any): string {
  const pos = bot.entity?.position;
  const items = Object.values(bot.inventory.slots || {})
    .filter(Boolean)
    .slice(0, 10)
    .map((item: any) => `${item.name} x${item.count}`)
    .join(", ");

  const nearbyEntities = Object.values(bot.entities || {})
    .filter((e: any) => e && e.position && e.type !== "object")
    .slice(0, 5)
    .map((e: any) => e.name || e.username || e.type)
    .join(", ");

  return `You are a Minecraft bot in survival mode. Current state:
HP: ${bot.health?.toFixed(1) ?? "??"}/20, Hunger: ${bot.food ?? "??"}/20
Position: ${pos ? `${pos.x.toFixed(0)} ${pos.y.toFixed(0)} ${pos.z.toFixed(0)}` : "unknown"}
Inventory: [${items || "empty"}]
Nearby entities: [${nearbyEntities || "none"}]
System prompt: ${config.systemPrompt ?? "Be a helpful survival bot"}

Respond with a JSON action like: {"action": "attack", "target": "zombie"} or {"action": "chat", "message": "hello"} or {"action": "look", "yaw": 0, "pitch": 0}`;
}

export async function getAiResponse(config: any, userMessage: string): Promise<string | null> {
  try {
    if (config.aiMode === "ollama") {
      return await callOllama(
        config.modelName ?? "llama3",
        userMessage,
        config.systemPrompt ?? ""
      );
    } else if (config.aiMode === "api" && config.apiKey) {
      return await callOpenAI(config.apiKey, config.modelName ?? "gpt-3.5-turbo", userMessage, config.systemPrompt ?? "");
    }
    return null;
  } catch (err) {
    logger.error({ err }, "AI response error");
    return null;
  }
}

export async function callOllama(model: string, prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      system: systemPrompt,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json() as { response: string };
  return data.response;
}

async function callOpenAI(apiKey: string, model: string, userMessage: string, systemPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? "";
}

export function isConnected(botId: number): boolean {
  return activeBots.has(botId);
}
