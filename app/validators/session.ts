import vine from "@vinejs/vine";

export const createSessionValidator = vine.compile(
    vine.object({
      username: vine.string().trim().regex(/^[a-zA-Z0-9.-_]+$/).minLength(3).maxLength(12).optional(),
      email: vine.string().trim().email().optional(),
      password: vine.string().trim(),
      rememberMe: vine.boolean().optional(),
    }),
);
