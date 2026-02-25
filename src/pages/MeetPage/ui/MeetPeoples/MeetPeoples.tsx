import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { MeetQueries } from "@/entities/Meet/api";
import { useMeetContext } from "@entities/Meet";
import styles from "./MeetPeoples.module.css";

export const MeetPeoples = () => {
  const { hash = "" } = useParams();
  const { data: users = [] } = useQuery({
    ...MeetQueries.meet(hash),
    select: data => data.users,
  });
  const hoveredUsers = useMeetContext(store => store.hoveredUsers);
  const newSelectedSlots = useMeetContext(store => store.newSelectedSlots);
  const setHoveredUser = useMeetContext(store => store.setHoveredUser);

  const handlePeersonChoose = (user: string) => {
    if (newSelectedSlots.size) return;
    setHoveredUser(user);
  };

  return (
    <>
      {(users.length || 0) > 0 ? (
        <div data-test-id='meet-people' className={styles.MeetPeoples}>
          <h3>
            Проголосовавшие:{" "}
            {hoveredUsers.length ? <span className={styles.MeetPeoples__Count}>{hoveredUsers.length} / </span> : null}
            <span className={styles.MeetPeoples__Count}>{users.length || ""}</span>
          </h3>
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
                className={
                  styles.MeetPeoples__user + (hoveredUsers.includes(user) ? " " + styles.MeetPeoples__user_hovered : "")
                }
              >
                {user}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};
