import { useFormState, useFormContext } from "react-hook-form";
import { Input } from "@/shared/components/Input/Input";
import { TextArea } from "@/shared/components/TextArea/TextArea";
import { TimeSelect } from "@/shared/components/TimeSelect/TimeSelect";
import { TIMES, DURATIONS } from "@/shared/consts/times";
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
    <div className={styles.MeetingForm}>
      <Input name='title' label='Название' placeholder='Название встречи' error={errors.title?.message} />
      <TextArea
        label='Описание'
        placeholder='Добавьте описание для вашей встречи'
        name='description'
        error={errors.description?.message}
      />
      <Input name='link' label='Ссылка на встречу' placeholder='Ссылка на встречу' error={errors.link?.message} />
      <div className={styles.MeetingForm__InputsTimes}>
        <TimeSelect
          name='time.start'
          label={"Начало"}
          placeholder='Выберите'
          options={TIMES}
          formatValue={formatTime}
          error={errors.time?.start?.message}
        />
        <TimeSelect
          name='time.end'
          label={"Конец"}
          placeholder='Выберите'
          options={TIMES}
          formatValue={formatTime}
          error={errors.time?.end?.message}
        />
      </div>
      <TimeSelect
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
