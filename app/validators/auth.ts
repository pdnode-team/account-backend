import vine from "@vinejs/vine";

export const sendEmailCodeValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        type: vine.enum(["verifyEmail"])
        // code: vine.number().max(999999).min(100000),
    }),
);
