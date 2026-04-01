import { useLayoutEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router";
import ApproveIcon from "@assets/icons/approve.svg";
import CancelIcon from "@assets/icons/cross.svg";
import { Input, TextArea } from "@shared/ui";
import { useGetMeetInfo } from "./api/useGetMeetInfo";
import { useUpdateMeetInfo } from "./api/useUpdateMeetInfo";
import styles from "./EditMeet.module.css";
import type { State, Action } from "./model/EditMeet.types";

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

export const EditMeet = () => {
  const { hash = "" } = useParams();
  const navigate = useNavigate();
  const meetData = useGetMeetInfo();
  const [formState, dispatch] = useReducer(reducer, {
    description: meetData.description,
    name: meetData.name,
    link: meetData.link,
    errors: {
      name: undefined,
      description: undefined,
      link: undefined,
    },
  });
  const { mutate: updateMeetInfo } = useUpdateMeetInfo(hash);

  useLayoutEffect(() => {
    dispatch({ type: "change", payload: { fieldName: "name", value: meetData.name } });
    dispatch({ type: "change", payload: { fieldName: "description", value: meetData.description || "" } });
    dispatch({ type: "change", payload: { fieldName: "link", value: meetData.link || "" } });
  }, [meetData.name, meetData.description, meetData.link]);

  const isChangedFields =
    meetData.link !== formState.link ||
    meetData.name !== formState.name ||
    meetData.description !== formState.description;
  const isSumbitButtonDisabled =
    !formState.name || Object.values(formState.errors).some(error => error) || !isChangedFields;

  return (
    <form
      className={styles.EditMeetPage}
      onSubmit={e => {
        e.preventDefault();
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
          {meetData.timeRanges.map(([startPeriodTime, endPeriodTime]) => (
            <div key={`${startPeriodTime}-${endPeriodTime}`} className={styles.EditMeetPage__InputsTimes}>
              <Input name='timeStart' disabled value={startPeriodTime.split(":").slice(0, 2).join(":")} />
              <div className={styles.EditMeetPage__InputsTimes__Separator} />
              <Input name='timeEnd' disabled value={endPeriodTime.split(":").slice(0, 2).join(":")} />
            </div>
          ))}
        </div>
        {meetData?.duration ? (
          <Input
            name='timeDuration'
            label='Продолжительность встречи'
            className={styles.MeetingForm__InputDuration}
            disabled
            value={meetData.duration}
          />
        ) : null}
        <Input
          name='link'
          label='Ссылка на встречу'
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
        <button
          onClick={() => {
            updateMeetInfo({
              name: formState.name,
              description: formState.description,
              link: formState.link,
            });
          }}
          type='submit'
          className='baseButton approveButton'
          disabled={isSumbitButtonDisabled}
        >
          <ApproveIcon />
          <span>Сохранить</span>
        </button>
      </div>
    </form>
  );
};
