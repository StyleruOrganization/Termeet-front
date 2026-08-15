import { useEffect, useState } from "react";
import { searchUsersRequest, useSessionStore, type IUserSearchItem } from "@/entities/User";
import { useTranslation } from "@/shared/i18n";
import { Input } from "@/shared/ui";
import CrossIcon from "@assets/icons/cross.svg";
import styles from "./InvitePeople.module.css";
import { useCreateMeetStore } from "../../model";

export const InvitePeople = () => {
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const invitedUsers = useCreateMeetStore(state => state.values.invitedUsers);
  const addInvitedUser = useCreateMeetStore(state => state.addInvitedUser);
  const removeInvitedUser = useCreateMeetStore(state => state.removeInvitedUser);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IUserSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!user || query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setOpen(false);
      return;
    }
    setSearched(false);
    const timer = setTimeout(() => {
      searchUsersRequest(query.trim())
        .then(items => {
          setResults(items.filter(item => !invitedUsers.some(invited => invited.id === item.id)));
          setSearched(true);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setSearched(true);
          setOpen(true);
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [invitedUsers, query, user]);

  if (!user) {
    return null;
  }

  const showList = open && (results.length > 0 || searched);

  return (
    <div className={styles.InvitePeople}>
      <div className={styles.InvitePeople__Field}>
        <Input
          name='invite'
          label={t("create.inviteLabel")}
          placeholder={t("create.invitePlaceholder")}
          value={query}
          onChange={event => setQuery(event.target.value)}
          onFocus={() => {
            if (results.length || searched) {
              setOpen(true);
            }
          }}
          suggestMessage={t("create.inviteHint")}
        />
        {showList ? (
          <ul className={styles.InvitePeople__List}>
            {results.length ? (
              results.map(item => (
                <li key={item.id}>
                  <button
                    type='button'
                    className={styles.InvitePeople__Option}
                    onClick={() => {
                      addInvitedUser({
                        id: item.id,
                        name: `${item.first_name} ${item.last_name}`.trim(),
                      });
                      setQuery("");
                      setResults([]);
                      setSearched(false);
                      setOpen(false);
                    }}
                  >
                    {item.first_name} {item.last_name}
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.InvitePeople__Empty}>{t("create.inviteEmpty")}</li>
            )}
          </ul>
        ) : null}
      </div>
      {invitedUsers.length ? (
        <div className={styles.InvitePeople__Chips}>
          {invitedUsers.map(item => (
            <div key={item.id} className={styles.InvitePeople__Chip}>
              <span>{item.name}</span>
              <button
                type='button'
                className={styles.InvitePeople__ChipRemove}
                onClick={() => removeInvitedUser(item.id)}
                aria-label={t("create.inviteRemove", { name: item.name })}
              >
                <CrossIcon />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
