import env from "#start/env";
import { defineConfig, transports } from "@adonisjs/mail";

const mailConfig = defineConfig({
  default: "smtp",

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  from: {
    address: env.get("SMTP_ADDRESS"),
    name: env.get("SMTP_NAME"),
  },
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') ?? "localhost",
      port: env.get('SMTP_PORT'),
    }),
  },
});

export default mailConfig;

declare module "@adonisjs/mail/types" {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
