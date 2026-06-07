import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as prepController from "./prep.controller.js";

export const prepRouter = Router();

prepRouter.use(authenticate);

prepRouter.post("/generate", prepController.generatePrepContent);
