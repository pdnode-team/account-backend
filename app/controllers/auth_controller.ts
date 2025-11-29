import User from "#models/user";
import { sendEmailCodeValidator } from "#validators/auth";
import type { HttpContext } from "@adonisjs/core/http";
import mail from "@adonisjs/mail/services/main";

export default class AuthController {
    async sendEmailCode({ request, response, session }: HttpContext) {
        const data = request.all();
        const payload = await sendEmailCodeValidator.validate(data);

        if (await User.findBy("email", payload.email)) {
            response.abort({
                status: "err_email_already_register",
            });
        }

        const min = 100000;
        const max = 999999;

        const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

        session.put("user.email.code", randomCode);

        await mail.sendLater((message) => {
            message
                .to(payload.email)
                .from("account@mail.pdnode.com")
                .subject(`Your email verification code: ${randomCode}`)
                .htmlView("emails/verify_email", { "code": randomCode });
        });

        response.json({ status: "succ_email_send" });
    }
}
