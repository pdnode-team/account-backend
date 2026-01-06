import vine from '@vinejs/vine'

export const updateEmailValidator = vine.compile(
  vine.object({
    newEmail: vine.string().trim().email(),
    newEmailCode: vine.number().min(100000).max(999999),
    oldEmailCode: vine.number().min(100000).max(999999),
  }),
);
