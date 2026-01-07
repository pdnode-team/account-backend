import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerUserValidator } from '#validators/user'
import logger from '@adonisjs/core/services/logger'
import redis from '@adonisjs/redis/services/main'
import { APP_STATUS_CODE, config } from '#start/pdnode'

export default class UsersController {
  /**
   * Display a list of resource
   */

  // async index({}: HttpContext) {}

  /**
   * Handle form submission for the creation action
   */
  async store({ request, response }: HttpContext) {
    const data = request.all()
    const payload = await registerUserValidator.validate(data, {
      meta: {
        bannedUsernames: config.banned.username,
        bannedNicknames: config.banned.nickname,
      },
    })

    const email = payload.email.toLowerCase()
    // const username = payload.username.toLowerCase();

    const storedCodeString = await redis.get(`auth:code:verifyEmail:email:${email}`)
    const storedCode = storedCodeString ? Number(storedCodeString) : null

    // 检查验证码是否为空或不匹配
    if (storedCode === null || payload.emailCode !== storedCode) {
      return response.badRequest({ status: APP_STATUS_CODE.E_WRONG_EMAIL_CODE })
    }

    const [userByEmail, userByUsername] = await Promise.all([
      User.findBy('email', email),
      User.query().whereILike('username', payload.username).first(),
    ])

    if (userByEmail || userByUsername) {
      return response.badRequest({ status: APP_STATUS_CODE.E_USERNAME_OR_EMAIL_EXISTING })
    }

    try {
      await User.create({
        username: payload.username,
        email: email,
        nickname: payload.nickname || null,
        password: payload.password,
      })
      redis.del(`auth:code:verifyEmail:email:${email}`)
    } catch (e: unknown) {
      logger.error(
        'An error occurred while creating the user, Error(s): ' + e + '\n\n\n Raw data: ' + payload
      )
      return response.internalServerError({
        msg: 'An error occurred while creating the user',
        status: APP_STATUS_CODE.FAILED,
      })
    }

    return response.created({ status: APP_STATUS_CODE.SUCCESS })
  }

  /**
   * Show individual record
   */
  // async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  // async edit({ params }: HttpContext) {}

  /**
   * Delete record
   */
  // async destroy({ params }: HttpContext) {}
}
