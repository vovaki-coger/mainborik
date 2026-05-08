import { Router, type IRouter } from "express";
import healthRouter from "./health";
import botsRouter from "./bots";
import modelsRouter from "./models";
import chatRouter from "./chat";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(botsRouter);
router.use(modelsRouter);
router.use(chatRouter);
router.use(settingsRouter);

export default router;
