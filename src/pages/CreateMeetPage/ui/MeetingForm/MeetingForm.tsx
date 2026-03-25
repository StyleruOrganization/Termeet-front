import { useMemo } from "react";
import { TIMES, DURATIONS, isTouchDevice } from "@/shared/libs";
import { InputForm } from "../InputForm";
import styles from "./MeetingForm.module.css";
import { isDurationValid, isTimeBefore } from "../../lib";
import { useCreateMeetStore } from "../../model";
import { Select } from "../Select";
import { TextAreaForm } from "../TextAreaForm";

export const MeetingForm = () => {
  const timeStart = useCreateMeetStore(state => state.values.timeStart);
  const timeEnd = useCreateMeetStore(state => state.values.timeEnd);

  const isTouch = useMemo(() => {
    return isTouchDevice();
  }, []);

  return (
    <div data-test-id='meeting-form' className={styles.MeetingForm}>
      <InputForm
        suggestMessage='Укажите название встречи'
        name='title'
        label='Название встречи'
        placeholder='«Лютый синк»'
      />
      <TextAreaForm
        label='Описание встречи'
        placeholder='Тут можно написать, о чем будет встреча'
        name='description'
        suggestMessage='Максимальное количество символов — 400.'
      />
      <div className={styles.MeetingForm__InputsTimes__Label}>Когда хотите встретиться?</div>
      <div className={styles.MeetingForm__InputsTimes}>
        <Select
          name='timeStart'
          placeholder='Выберите'
          options={TIMES}
          disabledFunc={time => !isTimeBefore(time, timeEnd)}
          readonly={isTouch}
        />
        <div className={styles.MeetingForm__InputsTimes__Separator} />
        <Select
          name='timeEnd'
          placeholder='Выберите'
          options={TIMES}
          disabledFunc={time => isTimeBefore(time, timeStart) || time == timeStart}
          readonly={isTouch}
        />
      </div>
      <Select
        name='timeDuration'
        label='Продолжительность встречи'
        className={styles.MeetingForm__InputDuration}
        placeholder='1 час'
        options={DURATIONS}
        disabledFunc={duration => !isDurationValid(duration, timeStart, timeEnd)}
        readonly
      />
      <InputForm name='link' label='Ссылка на встречу' placeholder='https://telemost.yandex.ru/j/122' />
    </div>
  );
};
