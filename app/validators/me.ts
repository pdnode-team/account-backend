import vine from '@vinejs/vine'
import { isBannedRule } from '#validators/user'

export const updateEmailValidator = vine.compile(
  vine.object({
    newEmail: vine.string().trim().email(),
    newEmailCode: vine.number().min(100000).max(999999),
    oldEmailCode: vine.number().min(100000).max(999999),

  }),
);

export const updatePasswordValidator = vine.compile(
  vine.object({
    newPassword: vine.string().trim().minLength(6).maxLength(24),
    oldPassword: vine.string().trim().minLength(6).maxLength(24),

  })
)

export const updateUsernameValidator = vine.compile(
  vine.object({
    newUsername: vine.string().trim().regex(/^[a-zA-Z0-9._-]+$/).minLength(3)
      .maxLength(12).use(isBannedRule({type: "username"})),
    password: vine.string().trim().minLength(6).maxLength(24),
  })
)
