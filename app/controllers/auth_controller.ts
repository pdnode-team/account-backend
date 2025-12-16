import User from "#models/user";
import { sendEmailCodeValidator } from "#validators/auth";
import type { HttpContext } from "@adonisjs/core/http";
import mail from "@adonisjs/mail/services/main";
import redis from '@adonisjs/redis/services/main'

export default class AuthController {
    async sendEmailCode({ request, response }: HttpContext) {

        // return response.json({ status: "succ_email_send" });

        
        const data = request.all();
        const payload = await sendEmailCodeValidator.validate(data);

        if (payload.type === "verifyEmail" && await User.findBy("email", payload.email)) {
            response.abort({
                status: "e_email_already_register",
            });
        }

        const min = 100000;
        const max = 999999;

        const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

        // 换成redis
        // session.put("user.email.code", randomCode);
        // 10分钟
        await redis.set(`user.email.code:${payload.email}`, randomCode, "EX", 60 * 10)

        await mail.sendLater((message) => {
            message
                .to(payload.email)
                .from("account@mail.pdnode.com")
                .subject(`Your email verification code: ${randomCode}`)
                .htmlView("emails/verify_email", { "code": randomCode });
        });

        return response.json({ status: "s_email_send" });
    }
}
