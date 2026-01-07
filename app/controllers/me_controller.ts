import type { HttpContext } from '@adonisjs/core/http'
import { updateEmailValidator, updatePasswordValidator, updateUsernameValidator } from '#validators/me'
import redis from '@adonisjs/redis/services/main'
import User from '#models/user'
import { APP_STATUS_CODE, config } from '#start/pdnode'
// MeController: /me/*
/*
   -- TODOS --
 * 添加更改用户邮箱 (2/2)
 * 添加更改用户名 (2/2)
 * 添加更改密码 (2/2)
*/
export default class MeController {
  async show({ response, auth }: HttpContext) {
    const user = auth.user
    return response.ok({ ...user, status: APP_STATUS_CODE.SUCCESS })
  }
  async updateEmail({ request, response, auth }: HttpContext) {
    const payload = await updateEmailValidator.validate(request.all())
    const user = auth.user!
    const oldEmailKey = `auth:code:updateEmail:uid:${user.id}`
    const savedOldCode = await redis.get(oldEmailKey)

    if (!savedOldCode || savedOldCode !== String(payload.oldEmailCode)) {
      return response.badRequest({ status: APP_STATUS_CODE.E_WRONG_EMAIL_CODE })
    }

    const newEmailKey = `auth:code:verifyEmail:email:${payload.newEmail}`
    const savedNewCode = await redis.get(newEmailKey)

    if (!savedNewCode || savedNewCode !== String(payload.newEmailCode)) {
      return response.badRequest({ status: APP_STATUS_CODE.E_WRONG_EMAIL_CODE })
    }

    const isTaken = await User.findBy('email', payload.newEmail)
    if (isTaken) {
      return response.conflict({ status: APP_STATUS_CODE.E_EMAIL_ALREADY_REGISTER })
    }

    user.email = payload.newEmail
    await user.save()

    await Promise.all([redis.del(oldEmailKey), redis.del(newEmailKey)])

    return response.ok({ status: APP_STATUS_CODE.SUCCESS })
  }
  async updatePassword({ request, response, auth }: HttpContext) {
    const { newPassword, oldPassword } = await updatePasswordValidator.validate(request.all())

    await User.verifyCredentials(auth.user!.username, oldPassword)

    if (newPassword === oldPassword) {
      return response.badRequest({ status: APP_STATUS_CODE.E_NEW_PASSWORD_SAME_AS_OLD_PASSWORD })
    }

    auth.user!.password = newPassword

    await auth.user!.save()

    return response.ok({ status: APP_STATUS_CODE.SUCCESS })
  }
  async updateUsername({ request, response, auth }: HttpContext) {
    const { newUsername, password } = await updateUsernameValidator.validate(request.all(), {
      meta: {
        bannedUsernames: config.banned.username,
      },
    })


    await User.verifyCredentials(auth.user!.username, password)

    if (await User.query().whereILike('username', newUsername).first()) return response.badRequest({ status: APP_STATUS_CODE.E_USERNAME_ALREADY_REGISTER })

    auth.user!.username = newUsername

    await auth.user!.save()

    return response.ok({ status: APP_STATUS_CODE.SUCCESS })


  }
}
