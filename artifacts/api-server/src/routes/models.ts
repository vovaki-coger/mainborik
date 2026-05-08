import { Router, type IRouter } from "express";
import {
  PullModelParams,
  PullModelResponse,
  DeleteModelParams,
  DeleteModelResponse,
  ListModelsResponse,
  GetOllamaStatusResponse,
} from "@workspace/api-zod";
import { callOllama } from "../lib/mineflayer";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const OLLAMA_BASE = "http://localhost:11434";

const MODEL_CATALOG = [
  { name: "llama3", displayName: "Llama 3 (8B)", ramRequired: "8GB", vramRequired: "6GB", description: "Meta's latest open-source LLM — fast and capable" },
  { name: "llama3:70b", displayName: "Llama 3 (70B)", ramRequired: "48GB", vramRequired: "40GB", description: "Large version of Llama 3 — highly capable" },
  { name: "mistral", displayName: "Mistral 7B", ramRequired: "6GB", vramRequired: "4GB", description: "Efficient and fast, great for Minecraft reasoning" },
  { name: "gemma2", displayName: "Gemma 2 (9B)", ramRequired: "8GB", vramRequired: "6GB", description: "Google's open model — well-rounded" },
  { name: "gemma2:27b", displayName: "Gemma 2 (27B)", ramRequired: "20GB", vramRequired: "16GB", description: "Larger Gemma 2 — excellent reasoning" },
  { name: "codellama", displayName: "CodeLlama 7B", ramRequired: "6GB", vramRequired: "4GB", description: "Code-focused model from Meta" },
  { name: "deepseek-r1", displayName: "DeepSeek R1 (7B)", ramRequired: "6GB", vramRequired: "4GB", description: "DeepSeek reasoning model" },
  { name: "phi3", displayName: "Phi-3 Mini (3.8B)", ramRequired: "3GB", vramRequired: "2GB", description: "Microsoft's compact but smart model" },
  { name: "phi3:medium", displayName: "Phi-3 Medium (14B)", ramRequired: "10GB", vramRequired: "8GB", description: "Larger Phi-3 for better reasoning" },
  { name: "qwen2.5", displayName: "Qwen 2.5 (7B)", ramRequired: "6GB", vramRequired: "4GB", description: "Alibaba's multilingual model (good for Russian/English)" },
  { name: "qwen2.5:72b", displayName: "Qwen 2.5 (72B)", ramRequired: "48GB", vramRequired: "40GB", description: "Large Qwen model — best multilingual performance" },
  { name: "neural-chat", displayName: "Neural Chat 7B", ramRequired: "6GB", vramRequired: "4GB", description: "Intel's chat-optimized model" },
];

async function getInstalledModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json() as { models: Array<{ name: string }> };
    return data.models.map((m) => m.name.split(":")[0]);
  } catch {
    return [];
  }
}

async function getInstalledModelsRaw(): Promise<Array<{ name: string; size: number }>> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json() as { models: Array<{ name: string; size: number }> };
    return data.models;
  } catch {
    return [];
  }
}

router.get("/models/ollama-status", async (_req, res): Promise<void> => {
  try {
    const r = await fetch(`${OLLAMA_BASE}/api/version`);
    if (r.ok) {
      const data = await r.json() as { version: string };
      res.json(GetOllamaStatusResponse.parse({ running: true, version: data.version, url: OLLAMA_BASE }));
    } else {
      res.json(GetOllamaStatusResponse.parse({ running: false, version: null, url: OLLAMA_BASE }));
    }
  } catch {
    res.json(GetOllamaStatusResponse.parse({ running: false, version: null, url: OLLAMA_BASE }));
  }
});

router.get("/models", async (_req, res): Promise<void> => {
  const installed = await getInstalledModelsRaw();
  const installedNames = new Set(installed.map((m) => m.name.split(":")[0]));

  const models = MODEL_CATALOG.map((m) => {
    const installedEntry = installed.find((i) => i.name.startsWith(m.name));
    const sizeBytes = installedEntry?.size ?? 0;
    const sizeMB = sizeBytes > 0 ? `${(sizeBytes / 1024 / 1024 / 1024).toFixed(1)}GB` : null;
    return {
      ...m,
      size: sizeMB,
      status: installedNames.has(m.name) ? "available" : "not_downloaded",
    };
  });

  res.json(ListModelsResponse.parse(models));
});

router.post("/models/:name/pull", async (req, res): Promise<void> => {
  const params = PullModelParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const modelName = params.data.name;
  logger.info({ modelName }, "Starting model pull");

  fetch(`${OLLAMA_BASE}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName, stream: false }),
  }).then(async (r) => {
    if (!r.ok) {
      logger.error({ modelName, status: r.status }, "Failed to pull model");
    } else {
      logger.info({ modelName }, "Model pull completed");
    }
  }).catch((err) => {
    logger.error({ err, modelName }, "Model pull error");
  });

  res.json(PullModelResponse.parse({ success: true, message: `Downloading ${modelName}...` }));
});

router.delete("/models/:name", async (req, res): Promise<void> => {
  const params = DeleteModelParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  try {
    const r = await fetch(`${OLLAMA_BASE}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: params.data.name }),
    });
    if (r.ok) {
      res.json(DeleteModelResponse.parse({ success: true, message: "Model deleted" }));
    } else {
      res.json(DeleteModelResponse.parse({ success: false, message: "Failed to delete model" }));
    }
  } catch (err) {
    logger.error({ err }, "Delete model error");
    res.json(DeleteModelResponse.parse({ success: false, message: String(err) }));
  }
});

export default router;
