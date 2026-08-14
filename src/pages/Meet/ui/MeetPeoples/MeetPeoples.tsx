import { useMemo } from "react";
import { useParams } from "react-router";
import { getMeetPermissions, useMeetStore } from "@/entities/Meet";
import { isTouchDevice } from "@/shared/libs";
import TrashIcon from "@assets/icons/trash-bin.svg";
import { CollapseContainer } from "@shared/ui";
import styles from "./MeetPeoples.module.css";
import { useDeleteParticipant } from "../../api";
import type { MeetPeoplesProps } from "./MeetPeoples.types";

export const MeetPeoples = ({
  users,
  userAuth,
  organizerName,
  mySlotName,
  observers,
  isCreator,
  data,
}: MeetPeoplesProps) => {
  const { hash = "" } = useParams();
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots);
  const setHoveredUser = useMeetStore(store => store.setHoveredUser);
  const hoveredUsers = useMeetStore(store => store.hoveredUsers);
  const hoveredUser = useMeetStore(store => store.hoveredUser);
  const isFinalizing = useMeetStore(store => store.isFinalizing);
  const { mutate: deleteParticipant, isPending } = useDeleteParticipant(hash);
  const permissions = getMeetPermissions(data);
  const canDelete = permissions.canDeleteParticipants;
  const showAuthBadge = isCreator && data.isCreatorAuth;

  const handlePersonChoose = (user: string) => {
    if (newSelectedSlots.size) return;
    setHoveredUser(user);
  };

  const isTouch = useMemo(() => isTouchDevice(), []);
  const hasHoveredUser = hoveredUsers.users.length > 0;

  return (
    <>
      <CollapseContainer
        maxHeight={users.length * 28}
        Title={
          <h3 className={styles.MeetPeoples__Title}>
            Участники: <span className={styles.MeetPeoples__Count}>{users.length}</span>
            {isFinalizing && hasHoveredUser ? (
              <span className={styles.MeetPeoples__LiveCount}>
                в этом времени {hoveredUsers.isEmptySlot ? 0 : hoveredUsers.users.length}
              </span>
            ) : null}
          </h3>
        }
        Content={
          users.length ? (
            <div className={styles.MeetPeoples__Users__Container}>
              {users.map(user => {
                const isHovered = hoveredUsers.users.includes(user);
                const shouldDim =
                  (hasHoveredUser && !isHovered) || (hoveredUser && hoveredUser !== user) || hoveredUsers.isEmptySlot;
                const canDeleteThis = canDelete && user !== mySlotName && user !== organizerName;

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
                      className={`${styles.MeetPeoples__UserName} ${isHovered ? styles.MeetPeoples__user_hovered : ""} ${isFinalizing && isHovered ? styles.MeetPeoples__UserName_can : ""}`}
                    >
                      {user}
                    </span>
                    {user === mySlotName ? <span className={styles.MeetPeoples__Badge}>Я</span> : null}
                    {user !== mySlotName && user === organizerName ? (
                      <span className={styles.MeetPeoples__Badge}>Создатель</span>
                    ) : null}
                    {showAuthBadge && user !== mySlotName && userAuth[user] ? (
                      <span className={styles.MeetPeoples__Badge}>С аккаунтом</span>
                    ) : null}
                    {canDeleteThis ? (
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
      {isCreator && observers.length > 0 ? (
        <CollapseContainer
          maxHeight={observers.length * 28}
          Title={
            <h3 className={styles.MeetPeoples__Title}>
              Наблюдают: <span className={styles.MeetPeoples__Count}>{observers.length}</span>
            </h3>
          }
          Content={
            <div className={styles.MeetPeoples__Users__Container}>
              {observers.map(name => (
                <div key={name} className={styles.MeetPeoples__User}>
                  <span className={styles.MeetPeoples__UserName}>{name}</span>
                </div>
              ))}
            </div>
          }
          initialExpanded={false}
        />
      ) : null}
    </>
  );
};
