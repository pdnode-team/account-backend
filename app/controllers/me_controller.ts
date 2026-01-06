import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateEmailValidator } from '#validators/me'
import redis from '@adonisjs/redis/services/main'

// MeController: /me/*
/*
   -- TODOS --
 * 添加更改用户邮箱 (2/2)
 * TODO: 添加更改用户名
 * TODO: 添加更改密码
*/
export default class MeController {
  async show({ response, auth }: HttpContext) {
    const user = auth.user
    return response.ok(user)
  }
  async updateEmail({ request, response, auth }: HttpContext) {
    const payload = await updateEmailValidator.validate(request.all())
    const user = auth.user!
    const oldEmailKey = `auth:code:updateEmail:uid:${user.id}`
    const savedOldCode = await redis.get(oldEmailKey)

    if (!savedOldCode || savedOldCode !== String(payload.oldEmailCode)) {
      return response.badRequest({ status: 'e_old_email_code_invalid' })
    }


    const newEmailKey = `auth:code:verifyEmail:email:${payload.newEmail}`
    const savedNewCode = await redis.get(newEmailKey)

    if (!savedNewCode || savedNewCode !== String(payload.newEmailCode)) {
      return response.badRequest({ status: 'e_new_email_code_invalid' })
    }

    const isTaken = await User.findBy('email', payload.newEmail)
    if (isTaken) {
      return response.conflict({ status: 'e_email_already_registered' })
    }

    user.email = payload.newEmail
    await user.save()

    await Promise.all([
      redis.del(oldEmailKey),
      redis.del(newEmailKey)
    ])

    return response.ok({ status: 's_email_updated' })




  }
}
