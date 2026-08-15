import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { listTeamsRequest } from "@/entities/Team";
import { useSessionStore } from "@/entities/User";
import { TIMES, DURATIONS } from "@/shared/consts";
import { useTranslation } from "@/shared/i18n";
import { isTimeBefore } from "@shared/libs";
import { Select } from "@shared/ui";
import styles from "./Form.module.css";
import { isDurationValid } from "../../lib";
import { useCreateMeetStore } from "../../model";
import { Input } from "../Input/Input";
import { InvitePeople } from "../InvitePeople/InvitePeople";
import { TeamSelect } from "../TeamSelect/TeamSelect";
import { TextArea } from "../TextArea/TextArea";
import { TimeSelect } from "../TimeSelect/TimeSelect";

const todayDateValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const Form = () => {
  const { t } = useTranslation();
  const user = useSessionStore(state => state.user);
  const setTime = useCreateMeetStore(state => state.setTime);
  const setValue = useCreateMeetStore(state => state.setValue);
  const timeStart = useCreateMeetStore(state => state.values.timeStart);
  const timeEnd = useCreateMeetStore(state => state.values.timeEnd);
  const teamId = useCreateMeetStore(state => state.values.teamId);
  const isClosed = useCreateMeetStore(state => state.values.isClosed);
  const inviteOnlyVote = useCreateMeetStore(state => state.values.inviteOnlyVote);
  const voteDeadlineDate = useCreateMeetStore(state => state.values.voteDeadlineDate);
  const voteDeadlineTime = useCreateMeetStore(state => state.values.voteDeadlineTime);
  const setClosed = useCreateMeetStore(state => state.setClosed);
  const setInviteOnlyVote = useCreateMeetStore(state => state.setInviteOnlyVote);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsRequest,
    enabled: Boolean(user),
  });
  const selectedTeam = teams.find(item => item.id === teamId) ?? null;
  const teamMemberIds = selectedTeam?.members.map(item => item.id) ?? [];

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
      <div className={styles.MeetingForm__InputsTimes__Label}>{t("create.voteDeadline")}</div>
      <div className={styles.MeetingForm__Deadline}>
        <Input
          className={styles.MeetingForm__DeadlineItem}
          name='voteDeadlineDate'
          type='date'
          label={t("create.voteDeadlineDate")}
          min={todayDateValue()}
        />
        <Select
          name='voteDeadlineTime'
          label={t("create.voteDeadlineTime")}
          placeholder={t("create.voteDeadlineTime")}
          options={TIMES}
          value={voteDeadlineTime}
          className={`${styles.MeetingForm__InputTimes__Input} ${styles.MeetingForm__DeadlineItem}`}
          onChange={option => setValue("voteDeadlineTime", option)}
        />
      </div>
      {voteDeadlineDate ? null : <p className={styles.MeetingForm__Hint}>{t("create.voteDeadlineHint")}</p>}
      <TeamSelect />
      <InvitePeople excludeIds={teamMemberIds} />
      {user ? (
        <>
          <label className={styles.MeetingForm__ToggleRow}>
            <span>{t("create.closed")}</span>
            <button
              type='button'
              role='switch'
              aria-checked={isClosed}
              className={`${styles.MeetingForm__Switch} ${isClosed ? styles.MeetingForm__Switch_on : ""}`}
              onClick={() => setClosed(!isClosed)}
            />
          </label>
          <p className={styles.MeetingForm__Hint}>{t("create.closedHint")}</p>
          {teamId ? (
            <>
              <label className={styles.MeetingForm__ToggleRow}>
                <span>{t("create.inviteOnly")}</span>
                <button
                  type='button'
                  role='switch'
                  aria-checked={inviteOnlyVote || isClosed}
                  disabled={isClosed}
                  className={`${styles.MeetingForm__Switch} ${inviteOnlyVote || isClosed ? styles.MeetingForm__Switch_on : ""}`}
                  onClick={() => setInviteOnlyVote(!(inviteOnlyVote || isClosed))}
                />
              </label>
              <p className={styles.MeetingForm__Hint}>{t("create.inviteOnlyHint")}</p>
            </>
          ) : null}
        </>
      ) : null}
      <Input name='link' label={t("create.link")} placeholder={t("create.linkPlaceholder")} />
      <p className={styles.MeetingForm__Hint}>{t("create.linkHint")}</p>
    </div>
  );
};
