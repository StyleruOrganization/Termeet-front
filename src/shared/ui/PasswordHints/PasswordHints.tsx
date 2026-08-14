import { useTranslation } from "react-i18next";
import ApproveIcon from "@assets/icons/approve.svg";
import styles from "./PasswordHints.module.css";
import { PASSWORD_RULES } from "./passwordRules";

const RULE_KEYS = {
  length: "login.passwordRuleLength",
  lower: "login.passwordRuleLower",
  upper: "login.passwordRuleUpper",
  digit: "login.passwordRuleDigit",
} as const;

interface PasswordHintsProps {
  value: string;
  highlight?: boolean;
}

export const PasswordHints = ({ value, highlight = false }: PasswordHintsProps) => {
  const { t } = useTranslation();

  if (!value && !highlight) {
    return null;
  }

  return (
    <ul className={styles.PasswordHints}>
      {PASSWORD_RULES.map(rule => {
        const done = rule.test(value);
        const itemClass = [
          styles.PasswordHints__Item,
          done ? styles.PasswordHints__Item_done : "",
          !done && highlight ? styles.PasswordHints__Item_fail : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={rule.id} className={itemClass}>
            <span className={styles.PasswordHints__Mark} aria-hidden>
              {done ? <ApproveIcon /> : null}
            </span>
            {t(RULE_KEYS[rule.id])}
          </li>
        );
      })}
    </ul>
  );
};
