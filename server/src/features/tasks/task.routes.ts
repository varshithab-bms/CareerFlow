import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as taskController from "./task.controller.js";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get("/", taskController.listTasks);
taskRouter.post("/", taskController.createTask);
taskRouter.patch("/:id", taskController.updateTask);
taskRouter.delete("/:id", taskController.deleteTask);
