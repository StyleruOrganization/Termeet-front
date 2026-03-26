import { useState } from "react";
import Arrow from "@/assets/icons/arrow.svg";
import { useMeetStore } from "@/entities/Meet";
import styles from "./MeetPeoples.module.css";

export const MeetPeoples = ({ users }: { users: string[] }) => {
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots),
    setHoveredUser = useMeetStore(store => store.setHoveredUser),
    hoveredUsers = useMeetStore(store => store.hoveredUsers);
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePeersonChoose = (user: string) => {
    if (newSelectedSlots.size) return;
    setHoveredUser(user);
    console.log(user);
  };

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
          >
            <Arrow />
          </button>
        </div>
        {users.length ? (
          <div className={styles.MeetPeoples__Users__Container}>
            {users.map(user => (
              <span
                key={user}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePeersonChoose(user);
                }}
                onPointerMove={() => {
                  handlePeersonChoose(user);
                }}
                onPointerLeave={() => {
                  handlePeersonChoose("");
                }}
                className={`${styles.MeetPeoples__user} ${hoveredUsers.includes(user) ? styles.MeetPeoples__user_hovered : ""}`}
              >
                {user}
              </span>
            ))}
          </div>
        ) : (
          <span>Пока никто не проголосовал !</span>
        )}
      </div>
    </>
  );
};
