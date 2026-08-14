export const PASSWORD_RULES = [
  { id: "length", test: (value: string) => value.length >= 8 },
  { id: "lower", test: (value: string) => /[a-zа-яё]/.test(value) },
  { id: "upper", test: (value: string) => /[A-ZА-ЯЁ]/.test(value) },
  { id: "digit", test: (value: string) => /\d/.test(value) },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]["id"];

export const isPasswordValid = (value: string) => PASSWORD_RULES.every(rule => rule.test(value));
