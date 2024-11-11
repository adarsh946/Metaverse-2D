import z from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters"),
  password: z.string().min(8),
  type: z.enum(["user", "admin"]),
});

export const signinSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const createSpaceSchema = z.object({
  name: z.string(),
  dimension: z.string().regex(/^1000x1000$/),
  mapId: z.string(),
});
