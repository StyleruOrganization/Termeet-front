import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { canEditMeet } from "@/entities/Meet";
import { searchUsersRequest, useSessionStore } from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { DURATIONS } from "@/shared/consts";
import { useTranslation } from "@/shared/i18n";
import { Container, Input, Select, TextArea, UserSearch } from "@/shared/ui";
import ApproveIcon from "@assets/icons/approve.svg";
import CrossIcon from "@assets/icons/cross.svg";
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
  duration: () => null,
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
  const addToast = useToastStore(store => store.addToast);
  const { t } = useTranslation();
  const currentUserId = useSessionStore(state => state.user?.id);
  const meetData = useGetMeetInfo();
  const canManage = canEditMeet(meetData);
  const showInvite = Boolean(currentUserId) && (meetData.isClosed || meetData.inviteOnlyVote);
  const savedInvitedKey = meetData.invitedUsers
    .map(item => item.id)
    .slice()
    .sort()
    .join(",");
  const [invitedUsers, setInvitedUsers] = useState(meetData.invitedUsers);
  const [formState, dispatch] = useReducer(reducer, {
    description: meetData.description,
    name: meetData.name,
    link: meetData.link,
    duration: meetData.duration || "",
    errors: {
      name: undefined,
      description: undefined,
      link: undefined,
    },
  });
  const { mutate: updateMeetInfo } = useUpdateMeetInfo(hash);

  useEffect(() => {
    if (canManage) {
      return;
    }

    addToast({
      id: "meet-edit-forbidden",
      type: "error",
      message: "Редактировать встречу может только организатор",
    });
    navigate(`/meet/${hash}`, { replace: true });
  }, [addToast, canManage, hash, navigate]);

  useLayoutEffect(() => {
    dispatch({ type: "change", payload: { fieldName: "name", value: meetData.name } });
    dispatch({ type: "change", payload: { fieldName: "description", value: meetData.description || "" } });
    dispatch({ type: "change", payload: { fieldName: "link", value: meetData.link || "" } });
    dispatch({ type: "change", payload: { fieldName: "duration", value: meetData.duration || "" } });
    setInvitedUsers(meetData.invitedUsers);
    // savedInvitedKey — стабильный список id; сам массив invitedUsers каждый рендер новый.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- см. savedInvitedKey
  }, [meetData.name, meetData.description, meetData.link, meetData.duration, savedInvitedKey]);

  const invitedChanged =
    invitedUsers
      .map(item => item.id)
      .slice()
      .sort()
      .join(",") !== savedInvitedKey;
  const isChangedFields =
    meetData.link !== formState.link ||
    meetData.name !== formState.name ||
    meetData.description !== formState.description ||
    (meetData.duration || "") !== formState.duration ||
    (showInvite && invitedChanged);
  const isSumbitButtonDisabled =
    !formState.name || Object.values(formState.errors).some(error => error) || !isChangedFields;

  if (!canManage) {
    return null;
  }

  return (
    <Container>
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
          <Select
            name='timeDuration'
            label='Продолжительность встречи'
            options={DURATIONS}
            value={formState.duration}
            placeholder='Выберите'
            onChange={value => {
              dispatch({ type: "change", payload: { fieldName: "duration", value } });
            }}
          />
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
          {showInvite ? (
            <div className={styles.EditMeetPage__Invite}>
              <UserSearch
                label={t("create.inviteLabel")}
                placeholder={t("create.invitePlaceholder")}
                hint={t("create.inviteEditHint")}
                emptyText={t("create.inviteEmpty")}
                excludeIds={[currentUserId ?? "", ...invitedUsers.map(item => item.id)]}
                searchUsers={searchUsersRequest}
                onPick={item => {
                  const name = `${item.first_name} ${item.last_name}`.trim();
                  setInvitedUsers(current =>
                    current.some(user => user.id === item.id)
                      ? current
                      : [...current, { id: item.id, name, hasAvatar: item.has_avatar }],
                  );
                }}
              />
              {invitedUsers.length ? (
                <div className={styles.EditMeetPage__Chips}>
                  {invitedUsers.map(item => (
                    <div key={item.id} className={styles.EditMeetPage__Chip}>
                      <span>{item.name}</span>
                      <button
                        type='button'
                        className={styles.EditMeetPage__ChipRemove}
                        onClick={() => setInvitedUsers(current => current.filter(user => user.id !== item.id))}
                        aria-label={t("create.inviteRemove", { name: item.name })}
                      >
                        <CrossIcon />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={styles.EditMeetPage__Buttons}>
          <button
            onClick={() => {
              navigate(`/meet/${hash}`);
            }}
            className='baseButton cancelButton'
          >
            <CrossIcon className={styles.EditMeetPage__CancelIcon} /> <span>Отменить</span>
          </button>
          <button
            onClick={() => {
              updateMeetInfo({
                name: formState.name,
                description: formState.description,
                link: formState.link,
                duration: formState.duration,
                invitedUserIds: showInvite ? invitedUsers.map(item => item.id) : undefined,
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
    </Container>
  );
};
