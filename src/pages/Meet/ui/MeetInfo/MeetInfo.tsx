import { canManageMeeting } from "@/entities/Meet";
import styles from "./MeetInfo.module.css";
import { MeetHeader } from "../MeetHeader/MeetHeader";
import { MeetModal } from "../MeetModal/MeetModal";
import { MeetPeoples } from "../MeetPeoples/MeetPeoples";
import { Onboarding } from "../Onboarding/Onboarding";
import type { IMeetInfoProps } from "./MeetInfo.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetInfo = ({ data }: IMeetInfoProps) => {
  const canManage = canManageMeeting(data.isCreator, data.isCreatorAuth);

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
              canManage={canManage}
            />
          ) : null}
        </div>
        <MeetPeoples users={data.users} canManage={canManage} />
        {WINDOW_WIDTH >= 768 ? <Onboarding /> : null}
      </div>
      <MeetModal />
    </>
  );
};
