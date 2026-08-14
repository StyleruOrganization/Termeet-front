import { useEffect, useState } from "react";
import { searchUsersRequest, useSessionStore, type IUserSearchItem } from "@/entities/User";
import { Input } from "@/shared/ui";
import styles from "./InvitePeople.module.css";
import { useCreateMeetStore } from "../../model";

export const InvitePeople = () => {
  const user = useSessionStore(state => state.user);
  const invitedUsers = useCreateMeetStore(state => state.values.invitedUsers);
  const addInvitedUser = useCreateMeetStore(state => state.addInvitedUser);
  const removeInvitedUser = useCreateMeetStore(state => state.removeInvitedUser);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IUserSearchItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchUsersRequest(query.trim())
        .then(items => {
          setResults(items.filter(item => !invitedUsers.some(invited => invited.id === item.id)));
          setOpen(true);
        })
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [invitedUsers, query, user]);

  if (!user) {
    return null;
  }

  return (
    <div className={styles.InvitePeople}>
      <Input
        name='invite'
        label='Пригласить из Termeet'
        placeholder='Имя или фамилия'
        value={query}
        onChange={event => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length) {
            setOpen(true);
          }
        }}
        suggestMessage='После создания встреча появится у них на главной в фильтре «Вас пригласили»'
      />
      {open && results.length ? (
        <ul className={styles.InvitePeople__List}>
          {results.map(item => (
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
                  setOpen(false);
                }}
              >
                {item.first_name} {item.last_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {invitedUsers.length ? (
        <div className={styles.InvitePeople__Chips}>
          {invitedUsers.map(item => (
            <button
              key={item.id}
              type='button'
              className={styles.InvitePeople__Chip}
              onClick={() => removeInvitedUser(item.id)}
            >
              {item.name} ×
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
