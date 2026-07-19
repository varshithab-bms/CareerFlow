import cors from "cors";
import express from "express";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { authRouter } from "./features/auth/auth.routes.js";
import { prepRouter } from "./features/prep/prep.routes.js";
import { taskRouter } from "./features/tasks/task.routes.js";
import resumeRouter from "./features/resume/resume.routes.js";
import interviewRouter from "./features/interview/interview.routes.js";
import { dashboardRouter } from "./features/dashboard/dashboard.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
app.set("trust proxy", 1);


const allowedOrigins = env.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? true
      : allowedOrigins,
  credentials: false,
};
app.use(helmet());
app.use(cors(corsOptions));

app.use("/api/v1/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
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
api.use("/dashboard", dashboardRouter);

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
