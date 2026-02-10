import { useFormState, useFormContext } from "react-hook-form";
import { FormInput } from "@/shared/components/Input/Input";
import { Select } from "@/shared/components/Select/Select";
import { TextArea } from "@/shared/components/TextArea/TextArea";
import { TIMES, DURATIONS } from "@/shared/consts/dateTimes";
import styles from "./MeetingForm.module.css";
import { formatTime } from "./MeetingForm.utils/timeFormat";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

export const MeetingForm = () => {
  const { control } = useFormContext<Meeting>();
  const { errors } = useFormState({
    control,
    name: ["title", "description", "link", "time.start", "time.end", "time.duration"],
  });
  return (
    <div data-test-id='meeting-form' className={styles.MeetingForm}>
      <FormInput name='title' label='Название' placeholder='Название встречи' error={errors.title?.message} />
      <TextArea
        label='Описание'
        placeholder='Добавьте описание для вашей встречи'
        name='description'
        error={errors.description?.message}
      />
      <FormInput name='link' label='Ссылка на встречу' placeholder='Ссылка на встречу' error={errors.link?.message} />
      <div className={styles.MeetingForm__InputsTimes}>
        <Select
          name='time.start'
          label={"Начало"}
          placeholder='Выберите'
          options={TIMES}
          formatValue={formatTime}
          error={errors.time?.start?.message}
        />
        <Select
          name='time.end'
          label={"Конец"}
          placeholder='Выберите'
          options={TIMES}
          formatValue={formatTime}
          error={errors.time?.end?.message}
        />
      </div>
      <Select
        name='time.duration'
        label={"Продолжительность"}
        placeholder='Выберите'
        options={DURATIONS}
        formatValue={(duration: string) => ({ isValid: true, value: duration })}
        readonly
        error={errors.time?.duration?.message}
      />
    </div>
  );
};
