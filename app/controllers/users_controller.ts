import type { HttpContext } from "@adonisjs/core/http";
import User from "#models/user";
import { registerUserValidator } from "#validators/user";
import logger from "@adonisjs/core/services/logger";
import redis from "@adonisjs/redis/services/main";
import { config } from "#start/kernel";

export default class UsersController {
  /**
   * Display a list of resource
   */

  /* -- TODO --
  * 
  */
  async index({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const data = request.all();
    const payload = await registerUserValidator.validate(data, {
      meta: {
        bannedUsernames: config.banned.username,
        bannedNicknames: config.banned.nickname
      }
    });

    const email = payload.email.toLowerCase();
    const username = payload.username.toLowerCase();
    

    const storedCodeString = await redis.get(`user.email.code:${email}`)
    const storedCode = storedCodeString ? Number(storedCodeString) : null
    
    // 检查验证码是否为空或不匹配
    if (storedCode === null || payload.emailCode !== storedCode) {
      return response.badRequest({ status: 'e_wrong_email_code' })
    }


    const [userByEmail, userByUsername] = await Promise.all([
      User.findBy("email", email),
      User.query()
        .whereILike("username", username),
    ]);

    if (userByEmail || userByUsername) {
      return response.badRequest({ status: "e_username_or_email_existing" });
    }



    try {
      await User.create({
        "username": username,
        "email": email,
        "nickname": payload.nickname || null,
        "password": payload.password,
      });
      redis.del(`user.email.code:${email}`);
      

    } catch (e: unknown) {
      logger.error(
        "An error occurred while creating the user, Error(s): " + e +
          "\n\n\n Raw data: " + payload,
      );
      return response.internalServerError({
        msg: "An error occurred while creating the user",
        status: "e_create_user_failed",
      });
    }


    return response.created({ status: "s_user_created" });
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
