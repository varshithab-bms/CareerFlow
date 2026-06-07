import bcrypt from "bcryptjs";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { signToken } from "../../utils/jwt.js";
import { User } from "./user.model.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export interface AuthUserDto {
  id: string;
  email: string;
  name?: string;
}

export async function register(body: unknown): Promise<{
  user: AuthUserDto;
  token: string;
}> {
  const data = registerSchema.parse(body);
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    email: data.email,
    passwordHash,
    name: data.name,
  });
  const token = signToken(user._id.toString());
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name ?? undefined,
    },
    token,
  };
}

export async function login(body: unknown): Promise<{
  user: AuthUserDto;
  token: string;
}> {
  const data = loginSchema.parse(body);
  const user = await User.findOne({ email: data.email }).select("+passwordHash");
  if (!user?.passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = signToken(user._id.toString());
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name ?? undefined,
    },
    token,
  };
}
