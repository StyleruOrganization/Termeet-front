import { TIMES, DURATIONS } from "@/shared/consts";
import { isTimeBefore } from "@shared/libs";
import styles from "./Form.module.css";
import { isDurationValid } from "../../lib";
import { useCreateMeetStore } from "../../model";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import { TextArea } from "../TextArea/TextArea";

export const Form = () => {
  const timeStart = useCreateMeetStore(state => state.values.timeStart);
  const timeEnd = useCreateMeetStore(state => state.values.timeEnd);

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
        <Select
          name='timeStart'
          placeholder='Выберите'
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => !isTimeBefore(time, timeEnd)}
        />
        <div className={styles.MeetingForm__InputsTimes__Separator} />
        <Select
          name='timeEnd'
          placeholder='Выберите'
          options={TIMES}
          className={styles.MeetingForm__InputTimes__Input}
          disabledFunc={time => isTimeBefore(time, timeStart) || time == timeStart}
        />
      </div>
      <Select
        name='timeDuration'
        label='Продолжительность встречи'
        className={styles.MeetingForm__InputTimes__Input}
        placeholder='1 час'
        options={DURATIONS}
        disabledFunc={duration => !isDurationValid(duration, timeStart, timeEnd)}
      />
      <Input name='link' label='Ссылка на встречу' placeholder='https://telemost.yandex.ru/j/122' />
    </div>
  );
};
