import bcrypt from "bcryptjs";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError.js";
import { signToken } from "../../utils/jwt.js";
import { User } from "./user.model.js";

const disposableEmailDomains = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "example.com",
  "test.com",
  "invalid.com",
]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateRealisticEmail(email: string) {
  const normalized = normalizeEmail(email);
  const domain = normalized.split("@")[1];

  if (!domain || disposableEmailDomains.has(domain)) {
    throw new ApiError(400, "Use a real personal or work email address");
  }

  if (domain.endsWith(".test") || domain.endsWith(".invalid") || domain.endsWith(".localhost")) {
    throw new ApiError(400, "Use a real personal or work email address");
  }

  return normalized;
}

const registerSchema = z.object({
  email: z.string().email().transform(normalizeEmail),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().max(60).optional(),
});

const loginSchema = z.object({
  email: z.string().email().transform(normalizeEmail),
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
  const email = validateRealisticEmail(data.email);
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    email,
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
  const email = validateRealisticEmail(data.email);
  const user = await User.findOne({ email }).select("+passwordHash");
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
