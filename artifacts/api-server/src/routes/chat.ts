import { Router, type IRouter } from "express";
import { ChatOfflineBody, ChatOfflineResponse } from "@workspace/api-zod";
import { callOllama } from "../lib/mineflayer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/chat/offline", async (req, res): Promise<void> => {
  const parsed = ChatOfflineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, modelName, systemPrompt, apiKey, aiMode } = parsed.data;

  try {
    let response: string;

    if (aiMode === "api" && apiKey) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: message },
          ],
        }),
      });
      if (!r.ok) throw new Error(`OpenAI error: ${r.status}`);
      const data = await r.json() as { choices: Array<{ message: { content: string } }> };
      response = data.choices[0]?.message?.content ?? "No response";
    } else {
      response = await callOllama(modelName, message, systemPrompt ?? "");
    }

    res.json(ChatOfflineResponse.parse({ response, model: modelName }));
  } catch (err) {
    logger.error({ err }, "Offline chat error");
    res.status(500).json({ error: String(err) });
  }
});

export default router;
