import { useTranslation } from "@/shared/i18n";
import { Container } from "@/shared/ui";
import styles from "./ClosedMeet.module.css";
import type { IMeet } from "@/entities/Meet";

const telegramHref = (value: string) => {
  if (value.startsWith("http")) {
    return value;
  }
  return `https://t.me/${value.replace(/^@/, "")}`;
};

const vkHref = (value: string) => {
  if (value.startsWith("http")) {
    return value;
  }
  return `https://vk.com/${value.replace(/^@/, "")}`;
};

export const ClosedMeet = ({ data }: { data: IMeet }) => {
  const { t } = useTranslation();
  const contacts = data.organizerContacts;
  const hasContacts = Boolean(contacts?.email || contacts?.telegram || contacts?.vk);

  return (
    <Container>
      <div className={styles.ClosedMeet}>
        <h1>{t("closed.title")}</h1>
        <p>{t("closed.body", { name: data.name })}</p>
        {data.organizerName ? <p>{t("closed.organizer", { name: data.organizerName })}</p> : null}
        {hasContacts ? (
          <ul className={styles.ClosedMeet__Contacts}>
            {contacts?.email ? (
              <li>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </li>
            ) : null}
            {contacts?.telegram ? (
              <li>
                <a href={telegramHref(contacts.telegram)} target='_blank' rel='noreferrer'>
                  Telegram: {contacts.telegram}
                </a>
              </li>
            ) : null}
            {contacts?.vk ? (
              <li>
                <a href={vkHref(contacts.vk)} target='_blank' rel='noreferrer'>
                  VK: {contacts.vk}
                </a>
              </li>
            ) : null}
          </ul>
        ) : (
          <p className={styles.ClosedMeet__Empty}>{t("closed.noContacts")}</p>
        )}
      </div>
    </Container>
  );
};
