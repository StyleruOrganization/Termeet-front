import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router";
import { MeetQueries } from "@/entities/Meet";
import ApproveIcon from "@assets/icons/approve.svg";
import CancelIcon from "@assets/icons/cross.svg";
import { Input, TextArea } from "@shared/ui";
import styles from "./EditMeetPage.module.css";
import type { IMeet } from "@entities/Meet";

interface State extends Pick<IMeet, "description" | "name" | "link"> {
  errors: Partial<Pick<IMeet, "description" | "name" | "link">>;
}
type Action = {
  type: "validate" | "change" | "clearError";
  payload: {
    value?: string;
    fieldName?: keyof Omit<State, "errors">;
  };
};

const validators: Record<keyof Omit<State, "errors">, (value: string) => string | null> = {
  description: description => {
    if (description.length > 400) return "Описание не должно превышать 400 символов";
    return null;
  },
  link: link => {
    if (!link) return null;
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(link)) return "Введите корректную ссылку (http:// или https://)";
    return null;
  },
  name: name => {
    if (!name.trim()) return "Название встречи обязательно";
    return null;
  },
};

const reducer = (state: State, action: Action): State => {
  const { type } = action;

  switch (type) {
    case "validate": {
      const { value, fieldName } = action.payload;
      if (!fieldName || value == undefined) return state;
      return {
        ...state,
        errors: {
          ...state.errors,
          [fieldName]: validators[fieldName](value),
        },
      };
    }
    case "change": {
      const { value, fieldName } = action.payload;
      if (!fieldName) return state;
      return {
        ...state,
        [fieldName]: value,
      };
    }
    case "clearError": {
      const { fieldName } = action.payload;
      if (!fieldName) return state;
      return {
        ...state,
        errors: {
          ...state.errors,
          [fieldName]: undefined,
        },
      };
    }
  }
};

export const EditMeetPage = () => {
  const { hash = "" } = useParams();
  const navigate = useNavigate();
  const { data } = useQuery(MeetQueries.meet(hash));
  const [formState, dispatch] = useReducer(reducer, {
    description: data?.description,
    name: data?.name || "",
    link: data?.link,
    errors: {
      name: undefined,
      description: undefined,
      link: undefined,
    },
  });

  console.log("FORM_STATE", formState);

  useLayoutEffect(() => {
    dispatch({ type: "change", payload: { fieldName: "name", value: data?.name } });
    dispatch({ type: "change", payload: { fieldName: "description", value: data?.description } });
    dispatch({ type: "change", payload: { fieldName: "link", value: data?.link } });
  }, [data]);

  console.log("DATA IN EDIT MEET PAGE", data);

  const isSumbitButtonDisabled = !formState.name || Object.values(formState.errors).some(error => error);

  return (
    <form
      className={styles.EditMeetPage}
      onSubmit={e => {
        e.preventDefault();
        console.log("Changed dataabout meet", formState);
      }}
    >
      <div className={styles.EditMeetPage__MeetingForm}>
        <h1>Редактирование встречи</h1>
        <Input
          suggestMessage='Укажите название встречи'
          name='name'
          label='Название встречи'
          placeholder='«Лютый синк»'
          value={formState.name}
          onChange={e => {
            dispatch({ type: "change", payload: { fieldName: "name", value: e.target.value } });
            dispatch({ type: "clearError", payload: { fieldName: "name" } });
          }}
          onBlur={e => dispatch({ type: "validate", payload: { fieldName: "name", value: e.target.value } })}
          error={formState.errors.name}
        />
        <TextArea
          label='Описание встречи'
          placeholder='Тут можно написать, о чем будет встреча'
          name='description'
          suggestMessage='Максимальное количество символов — 400.'
          value={formState.description}
          onChange={e => {
            dispatch({ type: "change", payload: { fieldName: "description", value: e.target.value } });
            dispatch({ type: "clearError", payload: { fieldName: "description" } });
          }}
          onBlur={e => dispatch({ type: "validate", payload: { fieldName: "description", value: e.target.value } })}
          error={formState.errors.description}
        />
        <div className={styles.EditMeetPage__InputsTimesWrapper}>
          <div className={styles.EditMeetPage__InputsTimes__Label}>Когда хотите встретиться?</div>
          {/* Пусть пока будет так если есть смещения по времени в часовых поясах */}
          {data?.timeRanges.map(([startPeriodTime, endPeriodTime]) => (
            <div key={`${startPeriodTime}-${endPeriodTime}`} className={styles.EditMeetPage__InputsTimes}>
              <Input name='timeStart' disabled value={startPeriodTime.split(":").slice(0, 2).join(":")} />
              <div className={styles.EditMeetPage__InputsTimes__Separator} />
              <Input name='timeEnd' disabled value={endPeriodTime.split(":").slice(0, 2).join(":")} />
            </div>
          ))}
        </div>
        {data?.duration ? (
          <Input
            name='timeDuration'
            label='Продолжительность встречи'
            className={styles.MeetingForm__InputDuration}
            disabled
            value={data.duration}
          />
        ) : null}
        <Input
          name='link'
          label='Ссылка на встречу'
          placeholder='https://telemost.yandex.ru/j/122'
          value={formState.link}
          onChange={e => {
            dispatch({ type: "change", payload: { fieldName: "link", value: e.target.value } });
            dispatch({ type: "clearError", payload: { fieldName: "link" } });
          }}
          onBlur={e => dispatch({ type: "validate", payload: { fieldName: "link", value: e.target.value } })}
          error={formState.errors.link}
        />
      </div>
      <div className={styles.EditMeetPage__Buttons}>
        <button
          onClick={() => {
            navigate(`/meet/${hash}`);
          }}
          className='baseButton cancelButton'
        >
          <CancelIcon className={styles.EditMeetPage__CancelIcon} /> <span>Отменить</span>
        </button>
        <button type='submit' className='baseButton approveButton' disabled={isSumbitButtonDisabled}>
          <ApproveIcon />
          <span>Сохранить</span>
        </button>
      </div>
    </form>
  );
};
