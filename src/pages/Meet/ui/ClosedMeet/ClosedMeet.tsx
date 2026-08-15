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
          <div>
            <p className={styles.ClosedMeet__ContactsTitle}>{t("closed.contactsTitle")}</p>
            <ul className={styles.ClosedMeet__Contacts}>
              {contacts?.email ? (
                <li>
                  <span className={styles.ClosedMeet__Label}>{t("closed.email")}</span>
                  <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                </li>
              ) : null}
              {contacts?.telegram ? (
                <li>
                  <span className={styles.ClosedMeet__Label}>{t("closed.telegram")}</span>
                  <a href={telegramHref(contacts.telegram)} target='_blank' rel='noreferrer'>
                    {contacts.telegram}
                  </a>
                </li>
              ) : null}
              {contacts?.vk ? (
                <li>
                  <span className={styles.ClosedMeet__Label}>{t("closed.vk")}</span>
                  <a href={vkHref(contacts.vk)} target='_blank' rel='noreferrer'>
                    {contacts.vk}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          <p className={styles.ClosedMeet__Empty}>{t("closed.noContacts")}</p>
        )}
      </div>
    </Container>
  );
};
