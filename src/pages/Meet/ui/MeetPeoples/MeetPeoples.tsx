import { useMemo } from "react";
import { useMeetStore } from "@/entities/Meet";
import { isTouchDevice } from "@/shared/libs";
import { CollapseContainer } from "@shared/ui";
import styles from "./MeetPeoples.module.css";
export const MeetPeoples = ({ users }: { users: string[] }) => {
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots),
    setHoveredUser = useMeetStore(store => store.setHoveredUser),
    hoveredUsers = useMeetStore(store => store.hoveredUsers),
    hoveredUser = useMeetStore(store => store.hoveredUser);

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
              // Если есть hovered пользователь и текущий не hovered, то затемняем или если есть ховер и это не ткущий пользователь
              const shouldDim =
                (hasHoveredUser && !isHovered) || (hoveredUser && hoveredUser !== user) || hoveredUsers.isEmptySlot;

              return (
                <span
                  key={user}
                  onPointerMove={() => {
                    if (!isTouch) handlePersonChoose(user);
                  }}
                  onPointerLeave={() => {
                    if (!isTouch) handlePersonChoose("");
                  }}
                  style={{
                    color: shouldDim ? "var(--text-disabled)" : "var(--text-main)",
                  }}
                  className={isHovered ? styles.MeetPeoples__user_hovered : ""}
                >
                  {user}
                </span>
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
