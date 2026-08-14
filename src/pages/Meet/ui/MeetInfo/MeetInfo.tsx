import { getMeetPermissions } from "@/entities/Meet";
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
      <MeetModal />
    </>
  );
};
