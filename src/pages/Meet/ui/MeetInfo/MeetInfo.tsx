import { getMeetPermissions } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { useLoginModalStore } from "@/shared/libs";
import styles from "./MeetInfo.module.css";
import { MeetHeader } from "../MeetHeader/MeetHeader";
import { MeetModal } from "../MeetModal/MeetModal";
import { MeetPeoples } from "../MeetPeoples/MeetPeoples";
import { MeetPrivacy } from "../MeetPrivacy/MeetPrivacy";
import { Onboarding } from "../Onboarding/Onboarding";
import type { IMeetInfoProps } from "./MeetInfo.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetInfo = ({ data, hash }: IMeetInfoProps) => {
  const permissions = getMeetPermissions(data);
  const user = useSessionStore(state => state.user);
  const openLogin = useLoginModalStore(state => state.open);

  return (
    <>
      <div className={styles.MeetInfo}>
        <div className={styles.MeetInfo__HeaderWrapper}>
          {WINDOW_WIDTH >= 768 ? (
            <MeetHeader
              duration={data.duration}
              description={data.description}
              name={data.name}
              link={data.link}
              canManage={permissions.canEditMeet}
            />
          ) : null}
        </div>
        {data.finalSlot.size > 0 ? (
          <p className={styles.MeetInfo__Banner}>
            {permissions.canSetFinal
              ? "Итоговое время назначено — фиолетовые ячейки. Слоты больше не принимают. Его можно изменить кнопкой внизу, участникам уйдёт письмо."
              : "Итоговое время уже назначено. Новые слоты не принимают — смотрите фиолетовые ячейки на сетке."}
          </p>
        ) : null}
        {permissions.isObserver ? (
          <p className={styles.MeetInfo__Banner}>
            Вы наблюдаете за этой встречей. Когда сохраните время, пропадёте из наблюдателей и появитесь в участниках.
          </p>
        ) : null}
        {data.requireLoginToVote && !user ? (
          <div className={styles.MeetInfo__LoginHint}>
            <p>
              Организатор включил голосование только для тех, кто вошёл в Termeet. Сетку можно смотреть без аккаунта,
              сохранить своё время — после входа.
            </p>
            <button type='button' className='baseButton mainButton' onClick={openLogin}>
              Войти, чтобы выбрать время
            </button>
          </div>
        ) : null}
        <MeetPeoples
          users={data.users}
          userAuth={data.userAuth}
          organizerName={data.organizerName}
          mySlotName={data.mySlotName}
          observers={data.observers}
          isCreator={data.isCreator}
          data={data}
        />
        <MeetPrivacy hash={hash} data={data} />
        {WINDOW_WIDTH >= 768 ? <Onboarding /> : null}
      </div>
      <MeetModal mySlotName={data.mySlotName} />
    </>
  );
};
