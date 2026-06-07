import cors from "cors";
import express from "express";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { authRouter } from "./features/auth/auth.routes.js";
import { prepRouter } from "./features/prep/prep.routes.js";
import { taskRouter } from "./features/tasks/task.routes.js";
import resumeRouter from "./features/resume/resume.routes.js";
import interviewRouter from "./features/interview/interview.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? true               // allow any origin in dev
      : env.CLIENT_ORIGIN, // production uses the env value
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

const api = express.Router();
api.use("/auth", authRouter);
api.use("/prep", prepRouter);
api.use("/tasks", taskRouter);
api.use("/resume", resumeRouter);
api.use("/interview", interviewRouter);

app.use("/api/v1", api);

app.use(errorHandler);

async function main() {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
    console.log("Backend restarted, new env variables loaded.");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
