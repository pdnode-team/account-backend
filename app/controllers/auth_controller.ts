import User from '#models/user'
import { sendEmailCodeValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import redis from '@adonisjs/redis/services/main'
import logger from '@adonisjs/core/services/logger'

export default class AuthController {
  async sendEmailCode({ request, response, auth }: HttpContext) {
    const data = request.all()
    const payload = await sendEmailCodeValidator.validate(data)

    // 1. 逻辑检查：如果是注册验证，邮箱必须未被占用
    if (payload.type === 'verifyEmail') {
      const existingUser = await User.findBy('email', payload.email)
      if (existingUser) {
        return response.conflict({ status: 'e_email_already_register' })
      }
    }else if (payload.type === 'updateEmail') { // 为了表达清楚，在这里重新写一遍，其实可以和验证邮箱一起写的
      await auth.authenticate()
      if (auth.user!.email !== payload.email) {
        return response.forbidden({ status: 'e_not_your_email' })
      }
    }

    // 2. 频率限制检查：检查该邮箱是否在 1 分钟内已经发过（防止滥用）
    const lastSent = await redis.get(`user.email.last_sent:${payload.email}`)
    if (lastSent) {
      return response.tooManyRequests({ status: 'e_email_send_too_fast' })
    }

    // 3. 生成验证码
    const randomCode = Math.floor(100000 + Math.random() * 900000)

    // 4. 使用原子操作或流水线存储到 Redis
    // Key 设计：使用 type + email，区分注册、改密、换邮箱等不同业务场景
    const identifier = auth.user ? `uid:${auth.user.id}` : `email:${payload.email}`
    const redisKey = `auth:code:${payload.type}:${identifier}`

    await Promise.all([
      // 存储验证码，10 分钟有效
      redis.set(redisKey, randomCode, 'EX', 60 * 10),
      // 存储发送标记，60 秒有效（用于频率限制）
      redis.set(`user.email.last_sent:${payload.email}`, 'true', 'EX', 60),
    ])

    // 5. 发送邮件
    try {
      await mail.send((message) => {
        message
          .to(payload.email)
          .subject(`[Pdnode] Verification Code: ${randomCode}`)
          .htmlView('emails/verify_email', { code: randomCode })
      })
    } catch (error) {
      logger.error(error)
      // 如果邮件发送失败，清理 Redis
      await redis.del(redisKey)
      return response.internalServerError({ status: 'e_email_send_failed' })
    }

    return response.ok({ status: 's_email_send' })
  }
}
