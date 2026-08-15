import { searchUsersRequest, useSessionStore } from "@/entities/User";
import { useTranslation } from "@/shared/i18n";
import { UserSearch } from "@/shared/ui";
import CrossIcon from "@assets/icons/cross.svg";
import styles from "./InvitePeople.module.css";
import { useCreateMeetStore } from "../../model";

export const InvitePeople = ({ excludeIds = [] }: { excludeIds?: string[] }) => {
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const invitedUsers = useCreateMeetStore(state => state.values.invitedUsers);
  const addInvitedUser = useCreateMeetStore(state => state.addInvitedUser);
  const removeInvitedUser = useCreateMeetStore(state => state.removeInvitedUser);

  if (!user) {
    return null;
  }

  return (
    <div className={styles.InvitePeople}>
      <UserSearch
        label={t("create.inviteLabel")}
        placeholder={t("create.invitePlaceholder")}
        hint={t("create.inviteHint")}
        emptyText={t("create.inviteEmpty")}
        excludeIds={[user.id, ...excludeIds, ...invitedUsers.map(item => item.id)]}
        searchUsers={searchUsersRequest}
        onPick={item =>
          addInvitedUser({
            id: item.id,
            name: `${item.first_name} ${item.last_name}`.trim(),
            hasAvatar: item.has_avatar,
          })
        }
      />
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
