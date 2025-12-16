import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
    vine.object({
        username: vine.string().regex(/^[a-z0-9]+$/).minLength(3).maxLength(12),
        nickname: vine.string().minLength(3).maxLength(12).nullable(),
        email: vine.string().email(),
        password: vine.string().minLength(6).maxLength(24),
        emailCode: vine.number().min(100000).max(999999)
    }),
);
