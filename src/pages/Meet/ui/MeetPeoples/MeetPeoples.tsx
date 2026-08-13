import { useMemo } from "react";
import { useParams } from "react-router";
import { useMeetStore } from "@/entities/Meet";
import { isTouchDevice } from "@/shared/libs";
import TrashIcon from "@assets/icons/trash-bin.svg";
import { CollapseContainer } from "@shared/ui";
import styles from "./MeetPeoples.module.css";
import { useDeleteParticipant } from "../../api";
import type { MeetPeoplesProps } from "./MeetPeoples.types";

export const MeetPeoples = ({ users, canManage }: MeetPeoplesProps) => {
  const { hash = "" } = useParams();
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots);
  const setHoveredUser = useMeetStore(store => store.setHoveredUser);
  const hoveredUsers = useMeetStore(store => store.hoveredUsers);
  const hoveredUser = useMeetStore(store => store.hoveredUser);
  const { mutate: deleteParticipant, isPending } = useDeleteParticipant(hash);

  const handlePersonChoose = (user: string) => {
    if (newSelectedSlots.size) return;
    setHoveredUser(user);
  };

  const isTouch = useMemo(() => isTouchDevice(), []);
  const hasHoveredUser = hoveredUsers.users.length > 0;

  return (
    <CollapseContainer
      maxHeight={users.length * 25}
      Title={
        <h3 className={styles.MeetPeoples__Title}>
          Участники: <span className={styles.MeetPeoples__Count}>{users.length}</span>
        </h3>
      }
      Content={
        users.length ? (
          <div className={styles.MeetPeoples__Users__Container}>
            {users.map(user => {
              const isHovered = hoveredUsers.users.includes(user);
              const shouldDim =
                (hasHoveredUser && !isHovered) || (hoveredUser && hoveredUser !== user) || hoveredUsers.isEmptySlot;

              return (
                <div key={user} className={styles.MeetPeoples__User}>
                  <span
                    onPointerMove={() => {
                      if (!isTouch) handlePersonChoose(user);
                    }}
                    onPointerLeave={() => {
                      if (!isTouch) handlePersonChoose("");
                    }}
                    style={{
                      color: shouldDim ? "var(--text-disabled)" : "var(--text-main)",
                    }}
                    className={`${styles.MeetPeoples__UserName} ${isHovered ? styles.MeetPeoples__user_hovered : ""}`}
                  >
                    {user}
                  </span>
                  {canManage ? (
                    <button
                      type='button'
                      className={styles.MeetPeoples__Delete}
                      aria-label={`Удалить участника ${user}`}
                      data-test-id='meet-delete-participant'
                      disabled={isPending}
                      onPointerDown={event => event.stopPropagation()}
                      onClick={event => {
                        event.stopPropagation();
                        deleteParticipant(user);
                      }}
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <span className={styles.StubMessage}>Пока никто не проголосовал</span>
        )
      }
      disabled={users.length == 0}
      initialExpanded={users.length ? true : false}
    />
  );
};
