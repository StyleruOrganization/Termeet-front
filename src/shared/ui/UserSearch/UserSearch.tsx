import { useEffect, useState } from "react";
import { userAvatarUrl } from "./photoUrls";
import styles from "./UserSearch.module.css";
import { Input } from "../Input/Input";

type UserSearchItem = {
  id: string;
  first_name: string;
  last_name: string;
  has_avatar?: boolean;
};

interface UserSearchProps {
  label: string;
  placeholder: string;
  hint?: string;
  emptyText: string;
  excludeIds?: string[];
  searchUsers: (query: string) => Promise<UserSearchItem[]>;
  onPick: (user: UserSearchItem) => void;
}

export const UserSearch = ({
  label,
  placeholder,
  hint,
  emptyText,
  excludeIds = [],
  searchUsers,
  onPick,
}: UserSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const excludeKey = excludeIds.join(",");

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setOpen(false);
      return;
    }
    const excluded = new Set(excludeKey.split(",").filter(Boolean));
    setSearched(false);
    const timer = setTimeout(() => {
      searchUsers(query.trim())
        .then(items => {
          setResults(items.filter(item => !excluded.has(item.id)));
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
  }, [excludeKey, query, searchUsers]);

  const showList = open && (results.length > 0 || searched);

  return (
    <div className={styles.UserSearch}>
      <Input
        name='user-search'
        label={label}
        placeholder={placeholder}
        value={query}
        onChange={event => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length || searched) {
            setOpen(true);
          }
        }}
        suggestMessage={hint}
      />
      {showList ? (
        <ul className={styles.UserSearch__List}>
          {results.length ? (
            results.map(item => (
              <li key={item.id}>
                <button
                  type='button'
                  className={styles.UserSearch__Option}
                  onClick={() => {
                    onPick(item);
                    setQuery("");
                    setResults([]);
                    setSearched(false);
                    setOpen(false);
                  }}
                >
                  {item.has_avatar ? (
                    <img src={userAvatarUrl(item.id)} alt='' className={styles.UserSearch__Avatar} />
                  ) : (
                    <span className={styles.UserSearch__AvatarFallback} aria-hidden>
                      {(item.first_name || "?").slice(0, 1)}
                    </span>
                  )}
                  <span>
                    {item.first_name} {item.last_name}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className={styles.UserSearch__Empty}>{emptyText}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
};
