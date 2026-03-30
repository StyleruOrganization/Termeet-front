import { useEffect, useState, useMemo } from "react";
import Arrow from "@/assets/icons/arrow.svg";
import { useMeetStore } from "@/entities/Meet";
import { isTouchDevice } from "@/shared/libs";
import styles from "./MeetPeoples.module.css";

export const MeetPeoples = ({ users }: { users: string[] }) => {
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots),
    setHoveredUser = useMeetStore(store => store.setHoveredUser),
    hoveredUsers = useMeetStore(store => store.hoveredUsers),
    hoveredUser = useMeetStore(store => store.hoveredUser);
  const [isExpanded, setIsExpanded] = useState(users.length ? true : false);

  const handlePersonChoose = (user: string) => {
    if (newSelectedSlots.size) return;
    setHoveredUser(user);
    console.log(user);
  };

  const isTouch = useMemo(() => isTouchDevice(), []);

  useEffect(() => {
    setIsExpanded(users.length ? true : false);
  }, [users]);

  const hasHoveredUser = hoveredUsers.users.length > 0;

  return (
    <>
      <div
        style={
          // Анимирую max-height поэтому надо посчитать
          {
            "--user-list-height": `${users.length * 28 - 8}px`,
          } as React.CSSProperties
        }
        className={`${styles.MeetPeoples} ${isExpanded ? styles.MeetPeoples__expanded : ""}`}
      >
        <div className={styles.MeetPeoples__Title}>
          <h3>
            Участники встречи<span className={styles.MeetPeoples__Count}>{users.length}</span>
          </h3>
          <button
            onClick={() => {
              setIsExpanded(prev => !prev);
            }}
            className={styles.MeetPeoples__ExpandButton + " " + styles.MeetHeader__Info__ExpandButton}
            disabled={users.length == 0}
          >
            <Arrow />
          </button>
        </div>
        {users.length ? (
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
                    color: shouldDim ? "var(--light-text-disabled)" : "var(--light-text-main)",
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
        )}
      </div>
    </>
  );
};
