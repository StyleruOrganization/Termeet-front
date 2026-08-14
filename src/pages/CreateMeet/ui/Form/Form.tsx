import { useEffect } from "react";
import { useSessionStore } from "@/entities/User";
import { TIMES, DURATIONS } from "@/shared/consts";
import { useTranslation } from "@/shared/i18n";
import { isTimeBefore, useLoginModalStore } from "@shared/libs";
import styles from "./Form.module.css";
import { isDurationValid } from "../../lib";
import { useCreateMeetStore } from "../../model";
import { Input } from "../Input/Input";
import { InvitePeople } from "../InvitePeople/InvitePeople";
import { TextArea } from "../TextArea/TextArea";
import { TimeSelect } from "../TimeSelect/TimeSelect";

export const Form = () => {
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const setTime = useCreateMeetStore(state => state.setTime);
  const timeStart = useCreateMeetStore(state => state.values.timeStart);
  const timeEnd = useCreateMeetStore(state => state.values.timeEnd);
  const createTelemost = useCreateMeetStore(state => state.values.createTelemost);
  const setCreateTelemost = useCreateMeetStore(state => state.setCreateTelemost);
  const openLogin = useLoginModalStore(state => state.open);

  useEffect(() => {
    if (!user) {
      return;
    }
    if (user.grid_window_start) {
      setTime("timeStart", user.grid_window_start);
    }
    if (user.grid_window_end) {
      setTime("timeEnd", user.grid_window_end);
    }
  }, [setTime, user]);

  const canCreateTelemost = Boolean(user?.has_telemost);
  const telemostHint = !user
    ? t("create.telemostNeedLogin")
    : user.has_telemost
      ? t("create.telemostHint")
      : user.has_yandex
        ? t("create.telemostNeedScope")
        : t("create.telemostNeedYandex");

  const handleTelemostToggle = () => {
    if (canCreateTelemost) {
      setCreateTelemost(!createTelemost);
      return;
    }
    if (!user) {
      openLogin();
      return;
    }
    window.location.assign("/api/auth/yandex/url?intent=link");
  };

  return (
    <div data-test-id='meeting-form' className={styles.MeetingForm}>
      <Input
        suggestMessage={t("create.titleHint")}
        name='title'
        label={t("create.title")}
        placeholder={t("create.titlePlaceholder")}
      />
      <TextArea
        label={t("create.description")}
        placeholder={t("create.descriptionPlaceholder")}
        name='description'
        suggestMessage={t("create.descriptionHint")}
      />
      <div className={styles.MeetingForm__InputsTimes__Label}>{t("create.when")}</div>
      <div className={styles.MeetingForm__InputsTimes}>
        <TimeSelect
          name='timeStart'
          placeholder={t("create.choose")}
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => !isTimeBefore(time, timeEnd)}
          initialValue='10:00'
        />
        <div className={styles.MeetingForm__InputsTimes__Separator} />
        <TimeSelect
          name='timeEnd'
          placeholder={t("create.choose")}
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => isTimeBefore(time, timeStart) || time == timeStart}
          initialValue='19:00'
        />
      </div>
      <TimeSelect
        name='timeDuration'
        label={t("create.duration")}
        className={styles.MeetingForm__InputTimes__Input}
        placeholder={t("create.durationPlaceholder")}
        options={DURATIONS}
        disabledFunc={duration => !isDurationValid(duration, timeStart, timeEnd)}
      />
      <InvitePeople />
      <label className={styles.MeetingForm__ToggleRow}>
        <span>{t("create.telemost")}</span>
        <button
          type='button'
          role='switch'
          aria-checked={createTelemost && canCreateTelemost}
          className={`${styles.MeetingForm__Switch} ${createTelemost && canCreateTelemost ? styles.MeetingForm__Switch_on : ""}`}
          onClick={handleTelemostToggle}
        />
      </label>
      <p className={styles.MeetingForm__Hint}>{telemostHint}</p>
      <Input name='link' label={t("create.link")} placeholder='https://telemost.yandex.ru/j/122' />
    </div>
  );
};
