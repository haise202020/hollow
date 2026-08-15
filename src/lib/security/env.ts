import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CSRF_SECRET: z.string().min(32).optional(),
});

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  CSRF_SECRET: process.env.CSRF_SECRET,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

if (process.env.NODE_ENV === "production" && !env.CSRF_SECRET) {
  throw new Error("CSRF_SECRET is required in production");
}
