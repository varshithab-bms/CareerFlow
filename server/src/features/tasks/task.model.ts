import mongoose, { type InferSchemaType, Schema } from "mongoose";

const taskStatuses = ["todo", "in-progress", "done"] as const;
const priorities = ["low", "medium", "high"] as const;

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: taskStatuses,
      default: "todo",
    },
    priority: {
      type: String,
      enum: priorities,
      default: "medium",
    },
    dueDate: { type: Date },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TaskStatuses = taskStatuses;
export const TaskPriorities = priorities;

export const Task =
  mongoose.models.Task ?? mongoose.model<TaskDocument>("Task", taskSchema);
