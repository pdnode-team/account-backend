import vine from "@vinejs/vine";
import { FieldContext } from "@vinejs/vine/types";

/**
 * 自定义违禁词规则
 * 逻辑：将当前值归一化（小写、去点）后，检查是否包含 meta 中的违禁词
 */

type RegistrationMeta = {
  bannedUsernames: string[]
  bannedNicknames: string[]
}

const isBannedRule = vine.createRule(
  (
    value: unknown,
    options: { type: "username" | "nickname" },
    field: FieldContext,
  ) => {
    // 1. 确保值是字符串
    if (typeof value !== "string") return;

    // 2. 归一化：转小写并去掉所有的点
    const normalized = value.toLowerCase().replace(/[._-]/g, "");

    // 3. 从 Meta 获取违禁词列表（如果没传则默认为空数组）
    const bannedList = options.type === "username"
      ? (field.meta.bannedUsernames || [])
      : (field.meta.bannedNicknames || []);

    // 4. 执行校验
    const hasBadWord = bannedList.some((word: string) =>
      normalized.includes(word.toLowerCase())
    );

    // 5. 如果包含违禁词，报告错误
    if (hasBadWord) {
      field.report(
        `${options.type === "username" ? "Username" : "Nickname"} contains prohibited words.`,
        `e_bad_${options.type}`,
        field,
      );
    }
  },
);

export const registerUserValidator = vine.withMetaData<RegistrationMeta>().compile(
  vine.object({
    username: vine.string().trim().regex(/^[a-zA-Z0-9._-]+$/).minLength(3)
      .maxLength(12).use(isBannedRule({type: "username"})),
    nickname: vine.string().trim().minLength(3).maxLength(12).use(isBannedRule({type: "nickname"})),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(6).maxLength(24),
    emailCode: vine.number().min(100000).max(999999),
  }),
)

