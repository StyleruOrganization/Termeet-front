import { useEffect, useState } from "react";
import { getMeetPermissions, type IMeet, type MeetSettingsUpdate } from "@/entities/Meet";
import { TIMES } from "@/shared/consts";
import { useNow } from "@/shared/libs";
import { Input, ModalWrapper, Select } from "@shared/ui";
import styles from "./MeetSettings.module.css";
import { useUpdateMeetSettings } from "../../api";

const MAX_PUSHES = 5;
const DEFAULT_OFFSET = 1440;

const OFFSETS = [
  { minutes: 15, label: "за 15 минут" },
  { minutes: 30, label: "за 30 минут" },
  { minutes: 60, label: "за 1 час" },
  { minutes: 180, label: "за 3 часа" },
  { minutes: 360, label: "за 6 часов" },
  { minutes: 720, label: "за 12 часов" },
  { minutes: 1440, label: "за 1 день" },
  { minutes: 2880, label: "за 2 дня" },
  { minutes: 4320, label: "за 3 дня" },
  { minutes: 10080, label: "за неделю" },
] as const;

const offsetLabel = (minutes: number) => OFFSETS.find(item => item.minutes === minutes)?.label ?? `за ${minutes} мин`;

const pad = (value: number) => String(value).padStart(2, "0");

const toVoteDeadlineIso = (date: string, time: string): string | null => {
  if (!date.trim()) {
    return null;
  }
  const clock = (time || "18 : 00").replace(/\s/g, "");
  const parsed = new Date(`${date}T${clock}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const splitVoteDeadline = (iso: string | null): { date: string; time: string } => {
  if (!iso) {
    return { date: "", time: "18 : 00" };
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "18 : 00" };
  }
  let hours = parsed.getHours();
  let minutes = parsed.getMinutes();
  if (minutes < 15) {
    minutes = 0;
  } else if (minutes < 45) {
    minutes = 30;
  } else if (hours >= 23) {
    minutes = 30;
  } else {
    hours += 1;
    minutes = 0;
  }
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(hours)} : ${pad(minutes)}`,
  };
};

const formatDeadline = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

const offsetStillPossible = (minutes: number, deadlineIso: string | null, now: number) => {
  if (!deadlineIso || now <= 0) {
    return false;
  }
  const deadline = new Date(deadlineIso).getTime();
  if (!(deadline > now)) {
    return false;
  }
  const sendAt = deadline - minutes * 60 * 1000;
  return sendAt > now;
};

type SettingsPatch = Partial<
  Pick<
    IMeet,
    | "anyoneCanEdit"
    | "anyoneCanDeleteParticipants"
    | "requireLoginToVote"
    | "anyoneCanSetFinal"
    | "isClosed"
    | "inviteOnlyVote"
    | "voteDeadline"
    | "remindEnabled"
    | "remindOffsets"
    | "lockVoteAfterDeadline"
  >
>;

const settingsFrom = (data: IMeet, patch: SettingsPatch): MeetSettingsUpdate => {
  const payload: MeetSettingsUpdate = {
    anyoneCanEdit: patch.anyoneCanEdit ?? data.anyoneCanEdit,
    anyoneCanDeleteParticipants: patch.anyoneCanDeleteParticipants ?? data.anyoneCanDeleteParticipants,
    requireLoginToVote: patch.requireLoginToVote ?? data.requireLoginToVote,
    anyoneCanSetFinal: patch.anyoneCanSetFinal ?? data.anyoneCanSetFinal,
    isClosed: patch.isClosed ?? data.isClosed,
    inviteOnlyVote: patch.inviteOnlyVote ?? data.inviteOnlyVote,
  };
  if (patch.voteDeadline !== undefined) {
    payload.voteDeadline = patch.voteDeadline;
  }
  if (patch.remindEnabled !== undefined) {
    payload.remindEnabled = patch.remindEnabled;
  }
  if (patch.remindOffsets !== undefined) {
    payload.remindOffsets = patch.remindOffsets;
  }
  if (patch.lockVoteAfterDeadline !== undefined) {
    payload.lockVoteAfterDeadline = patch.lockVoteAfterDeadline;
  }
  return payload;
};

interface MeetSettingsProps {
  hash: string;
  data: IMeet;
}

export const MeetSettings = ({ hash, data }: MeetSettingsProps) => {
  const permissions = getMeetPermissions(data);
  const { mutate, isPending } = useUpdateMeetSettings(hash);
  const [isOpen, setIsOpen] = useState(false);
  const split = splitVoteDeadline(data.voteDeadline);
  const [date, setDate] = useState(split.date);
  const [time, setTime] = useState(split.time);
  const now = useNow();

  useEffect(() => {
    const next = splitVoteDeadline(data.voteDeadline);
    setDate(next.date);
    setTime(next.time);
  }, [data.voteDeadline]);

  if (!permissions.canEditSettings) {
    return null;
  }

  const save = (patch: SettingsPatch) => {
    mutate(settingsFrom(data, patch));
  };

  const deadlineIso = toVoteDeadlineIso(date, time) ?? data.voteDeadline;
  const hasDeadline = Boolean(deadlineIso);
  const deadlinePassed = Boolean(deadlineIso && now > 0 && new Date(deadlineIso).getTime() <= now);
  const possibleOffsets = OFFSETS.filter(item => offsetStillPossible(item.minutes, deadlineIso, now));
  const offsets = data.remindOffsets.filter(minutes => offsetStillPossible(minutes, deadlineIso, now));
  const unusedPossible = possibleOffsets.filter(item => !offsets.includes(item.minutes));
  const showReminders = hasDeadline && !deadlinePassed && (data.remindEnabled || possibleOffsets.length > 0);

  const saveDeadline = (nextDate: string, nextTime: string) => {
    const iso = toVoteDeadlineIso(nextDate, nextTime);
    const nextOffsets = iso ? offsets.filter(minutes => offsetStillPossible(minutes, iso, now)) : [];
    save({
      voteDeadline: iso,
      remindEnabled: iso ? data.remindEnabled && nextOffsets.length > 0 : false,
      remindOffsets: nextOffsets,
      lockVoteAfterDeadline: iso ? data.lockVoteAfterDeadline : false,
    });
  };

  const defaultOffset = () => {
    if (possibleOffsets.some(item => item.minutes === DEFAULT_OFFSET)) {
      return DEFAULT_OFFSET;
    }
    return possibleOffsets[possibleOffsets.length - 1]?.minutes ?? null;
  };

  return (
    <>
      <button
        type='button'
        className={`baseButton outlineButton ${styles.MeetSettings__Open}`}
        onClick={() => setIsOpen(true)}
      >
        Настройки встречи
      </button>
      <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} isAnimate>
        <div className={styles.MeetSettings}>
          <h2 className={styles.MeetSettings__Title}>Настройки встречи</h2>

          <section className={styles.MeetSettings__Section}>
            <h3 className={styles.MeetSettings__SectionTitle}>Кто может что делать</h3>
            <SettingsRow
              label='Редактировать данные встречи могут все'
              checked={data.anyoneCanEdit}
              disabled={isPending}
              onToggle={() => save({ anyoneCanEdit: !data.anyoneCanEdit })}
            />
            <SettingsRow
              label='Удалять участников встречи могут все'
              checked={data.anyoneCanDeleteParticipants}
              disabled={isPending}
              onToggle={() => save({ anyoneCanDeleteParticipants: !data.anyoneCanDeleteParticipants })}
            />
            <SettingsRow
              label='Голосовать могут только с аккаунтом'
              checked={data.requireLoginToVote}
              disabled={isPending}
              onToggle={() => save({ requireLoginToVote: !data.requireLoginToVote })}
            />
            <SettingsRow
              label='Итоговое время могут назначать все, у кого есть аккаунт'
              checked={data.anyoneCanSetFinal}
              disabled={isPending}
              onToggle={() => save({ anyoneCanSetFinal: !data.anyoneCanSetFinal })}
            />
            <SettingsRow
              label='Закрытая встреча'
              checked={data.isClosed}
              disabled={isPending}
              onToggle={() => save({ isClosed: !data.isClosed })}
            />
            {data.teamId ? (
              <SettingsRow
                label='Голосовать могут только добавленные во встречу люди'
                checked={data.inviteOnlyVote || data.isClosed}
                disabled={isPending || data.isClosed}
                onToggle={() => save({ inviteOnlyVote: !(data.inviteOnlyVote || data.isClosed) })}
              />
            ) : null}
          </section>

          <section className={styles.MeetSettings__Section}>
            <h3 className={styles.MeetSettings__SectionTitle}>Дедлайн голосования</h3>
            <p className={styles.MeetSettings__Hint}>
              Дата и время, до которых нужно выбрать слоты. Можно оставить пустым.
            </p>
            <div className={styles.MeetSettings__Deadline}>
              <Input
                name='meet-vote-deadline-date'
                type='date'
                label='Дата'
                value={date}
                disabled={isPending}
                onChange={event => {
                  const nextDate = event.target.value;
                  setDate(nextDate);
                  saveDeadline(nextDate, time);
                }}
              />
              <Select
                name='meet-vote-deadline-time'
                label='Часы'
                placeholder='Часы'
                options={TIMES}
                value={time}
                className={styles.MeetSettings__Time}
                onChange={option => {
                  setTime(option);
                  if (date) {
                    saveDeadline(date, option);
                  }
                }}
              />
            </div>
            {deadlineIso ? <p className={styles.MeetSettings__Hint}>Сейчас: {formatDeadline(deadlineIso)}</p> : null}
            {hasDeadline ? (
              <SettingsRow
                label='После дедлайна закрыть голосование'
                checked={data.lockVoteAfterDeadline}
                disabled={isPending}
                onToggle={() => save({ lockVoteAfterDeadline: !data.lockVoteAfterDeadline })}
              />
            ) : null}
            {deadlinePassed && data.lockVoteAfterDeadline ? (
              <p className={styles.MeetSettings__Hint}>
                Голосование уже закрыто. Сдвиньте дедлайн или выключите закрытие, если слоты ещё нужны.
              </p>
            ) : null}
          </section>

          {showReminders ? (
            <section className={styles.MeetSettings__Section}>
              <h3 className={styles.MeetSettings__SectionTitle}>Напоминания проголосовать</h3>
              <p className={styles.MeetSettings__Hint}>
                Письмо уйдёт приглашённым с почтой в аккаунте, если они ещё не выбрали время. Организатору и
                наблюдателям не пишем. В список пушей попадают только те, что ещё успеют уйти до дедлайна.
              </p>
              {deadlinePassed ? (
                <p className={styles.MeetSettings__Hint}>
                  Дедлайн уже прошёл — новые письма не уйдут, пока не сдвинете дату и время.
                </p>
              ) : (
                <SettingsRow
                  label='Пушить людей, которые ещё не проголосовали'
                  checked={data.remindEnabled}
                  disabled={isPending}
                  onToggle={() => {
                    if (data.remindEnabled) {
                      save({ remindEnabled: false });
                      return;
                    }
                    const nextOffsets = offsets.filter(minutes => offsetStillPossible(minutes, deadlineIso, now));
                    const fallback = defaultOffset();
                    if (!nextOffsets.length && fallback == null) {
                      return;
                    }
                    save({
                      remindEnabled: true,
                      remindOffsets: nextOffsets.length ? nextOffsets : [fallback as number],
                    });
                  }}
                />
              )}
              {data.remindEnabled && !deadlinePassed ? (
                <>
                  {offsets.map((minutes, index) => {
                    const optionMinutes = possibleOffsets
                      .filter(item => item.minutes === minutes || !offsets.includes(item.minutes))
                      .map(item => item.minutes);
                    return (
                      <div className={styles.MeetSettings__PushRow} key={`${minutes}-${index}`}>
                        <Select
                          name={`meet-remind-offset-${index}`}
                          label={index === 0 ? "Когда напомнить" : undefined}
                          placeholder='Когда напомнить'
                          options={optionMinutes.map(offsetLabel)}
                          value={offsetLabel(minutes)}
                          className={styles.MeetSettings__Offset}
                          onChange={option => {
                            const nextMinutes = OFFSETS.find(item => item.label === option)?.minutes;
                            if (!nextMinutes || !offsetStillPossible(nextMinutes, deadlineIso, now)) {
                              return;
                            }
                            const next = offsets.map((item, itemIndex) => (itemIndex === index ? nextMinutes : item));
                            save({
                              remindOffsets: Array.from(
                                new Set(next.filter(item => offsetStillPossible(item, deadlineIso, now))),
                              ).sort((left, right) => left - right),
                            });
                          }}
                        />
                        {offsets.length > 1 ? (
                          <button
                            type='button'
                            className={`baseButton outlineButton ${styles.MeetSettings__Remove}`}
                            disabled={isPending}
                            onClick={() =>
                              save({ remindOffsets: offsets.filter((_, itemIndex) => itemIndex !== index) })
                            }
                          >
                            Убрать
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                  {offsets.length < MAX_PUSHES && unusedPossible.length > 0 ? (
                    <button
                      type='button'
                      className={`baseButton outlineButton ${styles.MeetSettings__Add}`}
                      disabled={isPending}
                      onClick={() => {
                        const nextOffset = unusedPossible[unusedPossible.length - 1]?.minutes;
                        if (nextOffset == null || !offsetStillPossible(nextOffset, deadlineIso, now)) {
                          return;
                        }
                        save({
                          remindOffsets: [...offsets, nextOffset]
                            .filter(item => offsetStillPossible(item, deadlineIso, now))
                            .sort((left, right) => left - right),
                        });
                      }}
                    >
                      Добавить пуш
                    </button>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : null}
        </div>
      </ModalWrapper>
    </>
  );
};

const SettingsRow = ({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) => {
  return (
    <label className={styles.MeetSettings__Row}>
      <span>{label}</span>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        className={`${styles.MeetSettings__Switch} ${checked ? styles.MeetSettings__Switch_on : ""}`}
        disabled={disabled}
        onClick={onToggle}
      />
    </label>
  );
};
