import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/entities/User";
import { TIMES } from "@/shared/consts";
import { startOfToday, useNow } from "@/shared/libs";
import { DatePicker, ModalWrapper, Select } from "@/shared/ui";
import styles from "./CreateMeetSettings.module.css";
import { formatLocalDate, maxVoteDeadlineDay } from "../../lib";
import { useCreateMeetStore } from "../../model";

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
  return deadline - minutes * 60 * 1000 > now;
};

export const CreateMeetSettings = () => {
  const user = useSessionStore(state => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const now = useNow();
  const values = useCreateMeetStore(state => state.values);
  const error = useCreateMeetStore(state => state.errors.voteDeadlineDate);
  const setValue = useCreateMeetStore(state => state.setValue);
  const patchValues = useCreateMeetStore(state => state.patchValues);
  const validateField = useCreateMeetStore(state => state.validateField);
  const setClosed = useCreateMeetStore(state => state.setClosed);
  const setInviteOnlyVote = useCreateMeetStore(state => state.setInviteOnlyVote);
  const pushOptionsRef = useRef<HTMLDivElement>(null);
  const wasRemindEnabled = useRef(values.remindEnabled);

  useEffect(() => {
    const justEnabled = values.remindEnabled && !wasRemindEnabled.current;
    wasRemindEnabled.current = values.remindEnabled;
    if (!justEnabled) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      pushOptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [values.remindEnabled]);

  const minDeadlineDate = formatLocalDate(startOfToday());
  const maxDeadlineDate = formatLocalDate(maxVoteDeadlineDay(values.dates));
  const deadlineIso = toVoteDeadlineIso(values.voteDeadlineDate, values.voteDeadlineTime);
  const hasDeadline = Boolean(deadlineIso);
  const deadlinePassed = Boolean(deadlineIso && now > 0 && new Date(deadlineIso).getTime() <= now);
  const possibleOffsets = OFFSETS.filter(item => offsetStillPossible(item.minutes, deadlineIso, now));
  const offsets = values.remindOffsets.filter(minutes => offsetStillPossible(minutes, deadlineIso, now));
  const unusedPossible = possibleOffsets.filter(item => !offsets.includes(item.minutes));
  const showReminders =
    Boolean(user) && hasDeadline && !deadlinePassed && (values.remindEnabled || possibleOffsets.length > 0);

  const setDeadline = (nextDate: string, nextTime: string) => {
    setValue("voteDeadlineDate", nextDate);
    setValue("voteDeadlineTime", nextTime);
    if (!nextDate.trim()) {
      patchValues({
        lockVoteAfterDeadline: false,
        remindEnabled: false,
        remindOffsets: [],
      });
    } else {
      const iso = toVoteDeadlineIso(nextDate, nextTime);
      const nextOffsets = iso ? values.remindOffsets.filter(minutes => offsetStillPossible(minutes, iso, now)) : [];
      patchValues({
        remindOffsets: nextOffsets,
        remindEnabled: values.remindEnabled && nextOffsets.length > 0,
      });
    }
    validateField("voteDeadlineDate");
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
        className={`baseButton outlineButton ${styles.CreateMeetSettings__Open}`}
        onClick={() => setIsOpen(true)}
      >
        Расширенные настройки
      </button>
      <ModalWrapper isOpen={isOpen} onClose={() => setIsOpen(false)} isAnimate>
        <div className={styles.CreateMeetSettings}>
          <h2 className={styles.CreateMeetSettings__Title}>Расширенные настройки</h2>

          {user ? (
            <section className={styles.CreateMeetSettings__Section}>
              <h3 className={styles.CreateMeetSettings__SectionTitle}>Кто может что делать</h3>
              <SettingsRow
                label='Редактировать данные встречи могут все'
                checked={values.anyoneCanEdit}
                onToggle={() => patchValues({ anyoneCanEdit: !values.anyoneCanEdit })}
              />
              <SettingsRow
                label='Удалять участников встречи могут все'
                checked={values.anyoneCanDeleteParticipants}
                onToggle={() => patchValues({ anyoneCanDeleteParticipants: !values.anyoneCanDeleteParticipants })}
              />
              <SettingsRow
                label='Голосовать могут только с аккаунтом'
                checked={values.requireLoginToVote}
                onToggle={() => patchValues({ requireLoginToVote: !values.requireLoginToVote })}
              />
              <SettingsRow
                label='Итоговое время могут назначать все, у кого есть аккаунт'
                checked={values.anyoneCanSetFinal}
                onToggle={() => patchValues({ anyoneCanSetFinal: !values.anyoneCanSetFinal })}
              />
              <SettingsRow
                label='Закрытая встреча'
                checked={values.isClosed}
                onToggle={() => setClosed(!values.isClosed)}
              />
              {values.teamId ? (
                <SettingsRow
                  label='Голосовать могут только добавленные во встречу люди'
                  checked={values.inviteOnlyVote || values.isClosed}
                  disabled={values.isClosed}
                  onToggle={() => setInviteOnlyVote(!(values.inviteOnlyVote || values.isClosed))}
                />
              ) : null}
            </section>
          ) : null}

          <section className={styles.CreateMeetSettings__Section}>
            <h3 className={styles.CreateMeetSettings__SectionTitle}>Дедлайн голосования</h3>
            <p className={styles.CreateMeetSettings__Hint}>
              Дата и время, до которых нужно выбрать слоты. Можно оставить пустым.
            </p>
            <div className={styles.CreateMeetSettings__Deadline}>
              <DatePicker
                name='create-vote-deadline-date'
                label='Дата'
                placeholder='Дата'
                value={values.voteDeadlineDate}
                min={minDeadlineDate}
                max={maxDeadlineDate}
                error={error}
                allowEmpty
                onChange={next => setDeadline(next, values.voteDeadlineTime)}
                onBlur={() => validateField("voteDeadlineDate")}
              />
              <Select
                name='create-vote-deadline-time'
                label='Часы'
                placeholder='Часы'
                options={TIMES}
                value={values.voteDeadlineTime}
                className={styles.CreateMeetSettings__Time}
                dropdownPlacement='right'
                onChange={option => setDeadline(values.voteDeadlineDate, option)}
              />
            </div>
            {deadlineIso && !error ? (
              <p className={styles.CreateMeetSettings__Hint}>Сейчас: {formatDeadline(deadlineIso)}</p>
            ) : null}
            {hasDeadline ? (
              <SettingsRow
                label='После дедлайна закрыть голосование'
                checked={values.lockVoteAfterDeadline}
                onToggle={() => patchValues({ lockVoteAfterDeadline: !values.lockVoteAfterDeadline })}
              />
            ) : null}
          </section>

          {showReminders ? (
            <section className={styles.CreateMeetSettings__Section}>
              <h3 className={styles.CreateMeetSettings__SectionTitle}>Напоминания проголосовать</h3>
              <p className={styles.CreateMeetSettings__Hint}>
                Письмо уйдёт приглашённым с почтой в аккаунте, если они ещё не выбрали время. Организатору и
                наблюдателям не пишем. В список пушей попадают только те, что ещё успеют уйти до дедлайна.
              </p>
              <SettingsRow
                label='Пушить людей, которые ещё не проголосовали'
                checked={values.remindEnabled}
                onToggle={() => {
                  if (values.remindEnabled) {
                    patchValues({ remindEnabled: false });
                    return;
                  }
                  const nextOffsets = offsets.filter(minutes => offsetStillPossible(minutes, deadlineIso, now));
                  const fallback = defaultOffset();
                  if (!nextOffsets.length && fallback == null) {
                    return;
                  }
                  patchValues({
                    remindEnabled: true,
                    remindOffsets: nextOffsets.length ? nextOffsets : [fallback as number],
                  });
                }}
              />
              {values.remindEnabled ? (
                <div ref={pushOptionsRef}>
                  {offsets.map((minutes, index) => {
                    const optionMinutes = possibleOffsets
                      .filter(item => item.minutes === minutes || !offsets.includes(item.minutes))
                      .map(item => item.minutes);
                    return (
                      <div className={styles.CreateMeetSettings__PushRow} key={`${minutes}-${index}`}>
                        <Select
                          name={`create-remind-offset-${index}`}
                          label={index === 0 ? "Когда напомнить" : undefined}
                          placeholder='Когда напомнить'
                          options={optionMinutes.map(offsetLabel)}
                          value={offsetLabel(minutes)}
                          className={styles.CreateMeetSettings__Offset}
                          onChange={option => {
                            const nextMinutes = OFFSETS.find(item => item.label === option)?.minutes;
                            if (!nextMinutes || !offsetStillPossible(nextMinutes, deadlineIso, now)) {
                              return;
                            }
                            const next = offsets.map((item, itemIndex) => (itemIndex === index ? nextMinutes : item));
                            patchValues({
                              remindOffsets: Array.from(
                                new Set(next.filter(item => offsetStillPossible(item, deadlineIso, now))),
                              ).sort((left, right) => left - right),
                            });
                          }}
                        />
                        {offsets.length > 1 ? (
                          <button
                            type='button'
                            className={`baseButton outlineButton ${styles.CreateMeetSettings__Remove}`}
                            onClick={() =>
                              patchValues({
                                remindOffsets: offsets.filter((_, itemIndex) => itemIndex !== index),
                              })
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
                      className={`baseButton outlineButton ${styles.CreateMeetSettings__Add}`}
                      onClick={() => {
                        const nextOffset = unusedPossible[unusedPossible.length - 1]?.minutes;
                        if (nextOffset == null || !offsetStillPossible(nextOffset, deadlineIso, now)) {
                          return;
                        }
                        patchValues({
                          remindOffsets: [...offsets, nextOffset]
                            .filter(item => offsetStillPossible(item, deadlineIso, now))
                            .sort((left, right) => left - right),
                        });
                      }}
                    >
                      Добавить пуш
                    </button>
                  ) : null}
                </div>
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
  disabled = false,
  onToggle,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) => {
  return (
    <label className={styles.CreateMeetSettings__Row}>
      <span>{label}</span>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        className={`${styles.CreateMeetSettings__Switch} ${checked ? styles.CreateMeetSettings__Switch_on : ""}`}
        disabled={disabled}
        onClick={onToggle}
      />
    </label>
  );
};
