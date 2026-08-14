import { useEffect } from "react";
import { useSessionStore } from "@/entities/User";
import { TIMES, DURATIONS } from "@/shared/consts";
import { isTimeBefore } from "@shared/libs";
import styles from "./Form.module.css";
import { isDurationValid } from "../../lib";
import { useCreateMeetStore } from "../../model";
import { Input } from "../Input/Input";
import { InvitePeople } from "../InvitePeople/InvitePeople";
import { TextArea } from "../TextArea/TextArea";
import { TimeSelect } from "../TimeSelect/TimeSelect";

const GRID_WINDOW_KEY = "termeet.gridWindow";

export const Form = () => {
  const user = useSessionStore(state => state.user);
  const setTime = useCreateMeetStore(state => state.setTime);
  const timeStart = useCreateMeetStore(state => state.values.timeStart);
  const timeEnd = useCreateMeetStore(state => state.values.timeEnd);

  useEffect(() => {
    if (!user) {
      return;
    }
    try {
      const raw = localStorage.getItem(GRID_WINDOW_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { start?: string; end?: string };
      if (parsed.start) {
        setTime("timeStart", parsed.start);
      }
      if (parsed.end) {
        setTime("timeEnd", parsed.end);
      }
    } catch {
      return;
    }
  }, [setTime, user]);

  return (
    <div data-test-id='meeting-form' className={styles.MeetingForm}>
      <Input
        suggestMessage='Укажите название встречи'
        name='title'
        label='Название встречи'
        placeholder='«Лютый синк»'
      />
      <TextArea
        label='Описание встречи'
        placeholder='Тут можно написать, о чем будет встреча'
        name='description'
        suggestMessage='Максимальное количество символов — 400.'
      />
      <div className={styles.MeetingForm__InputsTimes__Label}>Когда хотите встретиться?</div>
      <div className={styles.MeetingForm__InputsTimes}>
        <TimeSelect
          name='timeStart'
          placeholder='Выберите'
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => !isTimeBefore(time, timeEnd)}
          initialValue='10:00'
        />
        <div className={styles.MeetingForm__InputsTimes__Separator} />
        <TimeSelect
          name='timeEnd'
          placeholder='Выберите'
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => isTimeBefore(time, timeStart) || time == timeStart}
          initialValue='19:00'
        />
      </div>
      <TimeSelect
        name='timeDuration'
        label='Продолжительность встречи'
        className={styles.MeetingForm__InputTimes__Input}
        placeholder='1 час'
        options={DURATIONS}
        disabledFunc={duration => !isDurationValid(duration, timeStart, timeEnd)}
      />
      <InvitePeople />
      <Input name='link' label='Ссылка на встречу' placeholder='https://telemost.yandex.ru/j/122' />
    </div>
  );
};
