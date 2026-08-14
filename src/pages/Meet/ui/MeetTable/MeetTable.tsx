import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { useSessionStore, hasAvailability } from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { generateTimeOptions, isMoreOrEqThan30Min, copyTextToClipboard, useLoginModalStore } from "@/shared/libs";
import { Toggle } from "@/shared/ui";
import ApproveIcon from "@assets/icons/approve.svg";
import CancelIcon from "@assets/icons/cross.svg";
import LinkIcon from "@assets/icons/link.svg";
import { useMeetStore } from "@entities/Meet";
import styles from "./MeetTable.module.css";
import { useObserveMeeting, useSaveUserSelectedSlots } from "../../api";
import { getTimeZone, useColumnWidth } from "../../lib";
import { buildPrefillFromTemplate } from "../../lib/prefill/buildPrefillFromTemplate";
import { TableColumn } from "../TableColumn/TableColumn";
import type { MeetTableProps } from "./MeetTable.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetTable = ({
  timeRanges,
  meeting_days,
  mySlotName,
  canVote,
  canObserve,
  isObserver,
}: MeetTableProps) => {
  const { hash = "" } = useParams();
  const { measureContainerRef, columnWidth, calculateColumnWidth } = useColumnWidth(meeting_days);
  const setHoveredUsers = useMeetStore(store => store.setHoveredUsers);
  const setHoveredUser = useMeetStore(store => store.setHoveredUser);
  const isEditingMode = useMeetStore(store => store.isEditing);
  const setIsEditing = useMeetStore(store => store.setIsEditing);
  const startEditingSlots = useMeetStore(store => store.startEditingSlots);
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots);
  const setIsModalOpen = useMeetStore(store => store.setIsModalOpen);
  const clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);
  const { mutate: saveOwnSlots } = useSaveUserSelectedSlots(hash, () => {
    setIsEditing(false);
  });
  const { mutate: observeMeeting, isPending: isObservePending } = useObserveMeeting(hash);
  const openLogin = useLoginModalStore(state => state.open);
  const addToast = useToastStore(store => store.addToast);
  const user = useSessionStore(state => state.user);
  const timeInfo = useMeetStore(store => store.timeInfo);
  const [searchParams, setSearchParams] = useSearchParams();
  // Состояние для управления transition
  const [disableTransition, setDisableTransition] = useState(false);

  // Отключаем transition при входе в режим редактирования
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isEditingMode) {
      // Сбрасываем предыдущий таймер если есть
      setDisableTransition(true);

      timer = setTimeout(() => {
        setDisableTransition(false);
      }, 300);
    } else {
      // При выходе из режима редактирования сразу включаем transition обратно
      setDisableTransition(true);

      timer = setTimeout(() => {
        setDisableTransition(false);
      }, 300);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isEditingMode]);

  const transitionStyle = disableTransition
    ? "none"
    : "background-color 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out";

  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const timeOptions = useMemo(() => {
    return timeRanges.map(([startTime, endTime]) => {
      const times = generateTimeOptions(startTime, endTime, 60);

      return times.map(([hours, minutes]) => {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      });
    });
  }, [timeRanges]);

  const timeZones = useMemo(() => {
    return getTimeZone();
  }, []);

  const handleToggleChange = (dir: "left" | "right") => {
    if (timeZones.local.timeZoneOffset == timeZones.moscow.timeZoneOffset) return;
    const newValue = dir === "left";

    setSearchParams({ localTime: newValue.toString() }, { replace: true });
  };
  useEffect(() => {
    requestAnimationFrame(() => {
      calculateColumnWidth();
    });
  }, [calculateColumnWidth]);

  useEffect(() => {
    const cancelHoveredUsers = () => {
      setHoveredUsers([], false);
      setHoveredUser("");
    };
    window.addEventListener("click", cancelHoveredUsers);
    return () => window.removeEventListener("click", cancelHoveredUsers);
  }, [setHoveredUsers, setHoveredUser]);

  return (
    <div className={styles.MeetTableWrapper}>
      <div className={styles.MeetTable}>
        <div className={styles.MeetTable__TimesPeriodsContainer}>
          {timeOptions.map((timePeriodOpitions, indexPeriods) => (
            <div key={indexPeriods}>
              <div
                style={{
                  marginBottom: `${isMoreOrEqThan30Min(timePeriodOpitions[timePeriodOpitions.length - 1], timeRanges[indexPeriods][1]) ? 20 : 0}px`,
                }}
                className={styles.MeetTable__TimesPeriod}
                key={`period-${indexPeriods}`}
              >
                {timePeriodOpitions.map(timeOption => (
                  <span key={timeOption}>{timeOption}</span>
                ))}
              </div>
              {indexPeriods < timeOptions.length - 1 && (
                <div className={styles.MeetTable__TimesPeriodSeparator}>...</div>
              )}
            </div>
          ))}
        </div>
        {/* Две обертки так как по одной расчитываем ширину колонки а другая является скролл контейнером */}
        <div className={styles.MeetTable__ColumnsWrapper}>
          <div ref={measureContainerRef} className={styles.MeetTable__Columns}>
            {meeting_days.map((columnId, index) => (
              <div
                key={index}
                style={{ width: `${columnWidth}px` }}
                data-column-id={columnId}
                className={styles.MeetTable__ColumnWrapper}
              >
                <TableColumn timeRanges={timeRanges} columnWidth={columnWidth} key={index} columnId={columnId} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.MeetTable__ButtonsWrapper}>
        <div className={styles.MeetTable__Buttons}>
          {!isEditingMode || (isEditingMode && WINDOW_WIDTH < 768) ? (
            <button
              onClick={() => {
                copyTextToClipboard(
                  window.location.href,
                  addToast,
                  "Ссылка скопирована",
                  "Не удалось скопировать ссылку",
                );
              }}
              style={{
                transition: transitionStyle,
                borderRadius: WINDOW_WIDTH < 768 ? "16px" : "160px",
              }}
              className={styles.MeetTable__ShareButton}
            >
              <LinkIcon />
              {WINDOW_WIDTH < 768 ? "Поделиться встречей" : ""}
            </button>
          ) : null}
          <div className={styles.MeetTable__ButtonsEdit}>
            {isEditingMode ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    clearNewSelectedSlots();
                  }}
                  className={`baseButton cancelButton`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  <CancelIcon className={styles.MeetTable__CancelIcon} /> <span>Отменить</span>
                </button>
                <button
                  disabled={mySlotName ? false : !newSelectedSlots.size}
                  onClick={() => {
                    if (mySlotName) {
                      saveOwnSlots({ name: mySlotName, isEdit: true });
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  className={`baseButton approveButton`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  <ApproveIcon />
                  <span>Сохранить</span>
                </button>
              </>
            ) : (
              <>
                {/* <button className={"baseButton secondaryButton"}>Назначить встречу</button> */}
                <button
                  onClick={() => {
                    if (!canVote) {
                      openLogin();
                      addToast({
                        id: "meet-login-to-vote",
                        type: "info",
                        message: "Чтобы выбрать время, войдите в аккаунт",
                      });
                      return;
                    }
                    startEditingSlots(mySlotName);
                  }}
                  className={`baseButton mainButton ${styles.MeetTable__AddTimeButton}`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  {mySlotName ? "Изменить время" : "Добавить время"}
                </button>
                {!mySlotName && canVote && hasAvailability(user?.availability_template ?? []) ? (
                  <button
                    type='button'
                    className={`baseButton outlineButton ${styles.MeetTable__AddTimeButton}`}
                    style={{
                      transition: transitionStyle,
                    }}
                    onClick={() => {
                      const prefill = buildPrefillFromTemplate(timeInfo, user?.availability_template ?? []);
                      if (!prefill.size) {
                        addToast({
                          id: "prefill-empty",
                          type: "info",
                          message: "Шаблон не пересекается с окном этой встречи",
                        });
                        return;
                      }
                      startEditingSlots(null, prefill);
                    }}
                  >
                    Подставить шаблон
                  </button>
                ) : null}
                {canObserve ? (
                  <button
                    type='button'
                    className={`baseButton outlineButton ${styles.MeetTable__AddTimeButton}`}
                    disabled={isObservePending}
                    onClick={() => observeMeeting()}
                  >
                    Наблюдать
                  </button>
                ) : null}
                {isObserver && !mySlotName ? (
                  <span className={styles.MeetTable__ObserverHint}>Вы наблюдатель</span>
                ) : null}
              </>
            )}
          </div>
        </div>
        {!isEditingMode && (
          <Toggle
            LeftLabel={"По местному " + timeZones.local.utcString}
            RightLabel={"По Москве " + timeZones.moscow.utcString}
            defaultActive={isLocalTime ? "left" : "right"}
            onChange={handleToggleChange}
          />
        )}
      </div>
    </div>
  );
};
