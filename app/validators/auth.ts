import vine from "@vinejs/vine";

export const sendEmailCodeValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        // code: vine.number().max(999999).min(100000),
    }),
);
