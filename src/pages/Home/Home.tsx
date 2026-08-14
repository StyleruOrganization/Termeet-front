import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getMyMeetingsRequest, useSessionStore, type IUserMeeting, type UserMeetingRole } from "@/entities/User";
import { Container } from "@/shared/ui";
import Arrow from "@assets/icons/arrow.svg";
import styles from "./Home.module.css";

type DateFilter = "all" | "today" | "byDate" | "noTime";
type RoleFilter = "all" | UserMeetingRole;
type HomeTab = "meetings" | "history";

const ROLE_LABEL: Record<UserMeetingRole, string> = {
  owner: "Создатель",
  participant: "Участник",
  observer: "Наблюдатель",
};

const weekdayShort = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const monthTitle = (date: Date) =>
  date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(" г.", "");

const toDayKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const firstRangeDay = (meeting: IUserMeeting) => meeting.dataRange?.[0]?.[0]?.slice(0, 10) ?? "";

const formatGroupTitle = (isoDay: string) => {
  if (!isoDay) {
    return "Дата не указана";
  }
  const date = new Date(`${isoDay}T00:00:00`);
  const weekday = weekdayShort[date.getDay()];
  return `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}, ${weekday}`;
};

export const Home = () => {
  const user = useSessionStore(state => state.user);
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [tab, setTab] = useState<HomeTab>("meetings");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const {
    data: meetings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-meetings"],
    queryFn: getMyMeetingsRequest,
    retry: 1,
  });

  const markedDays = useMemo(() => {
    const days = new Set<string>();
    meetings.forEach(meeting => {
      meeting.dataRange?.forEach(([start]) => {
        if (start) {
          days.add(start.slice(0, 10));
        }
      });
    });
    return days;
  }, [meetings]);

  const todayKey = toDayKey(new Date());

  const visibleMeetings = useMemo(() => {
    if (tab === "history") {
      return [];
    }

    return meetings.filter(meeting => {
      if (roleFilter !== "all" && meeting.role !== roleFilter) {
        return false;
      }

      const day = firstRangeDay(meeting);
      if (dateFilter === "today") {
        return day === todayKey;
      }
      if (dateFilter === "byDate" && selectedDay) {
        return meeting.dataRange?.some(range => range[0]?.slice(0, 10) === selectedDay);
      }
      if (dateFilter === "noTime") {
        return !meeting.duration;
      }
      return true;
    });
  }, [dateFilter, meetings, roleFilter, selectedDay, tab, todayKey]);

  const grouped = useMemo(() => {
    const groups = new Map<string, IUserMeeting[]>();
    visibleMeetings.forEach(meeting => {
      const key = firstRangeDay(meeting) || "none";
      const list = groups.get(key) ?? [];
      list.push(meeting);
      groups.set(key, list);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visibleMeetings]);

  return (
    <Container>
      <div className={styles.Home}>
        <aside className={styles.Home__Sidebar}>
          <HomeCalendar
            month={month}
            markedDays={markedDays}
            selectedDay={selectedDay}
            onMonthChange={setMonth}
            onSelectDay={day => {
              setSelectedDay(day);
              setDateFilter("byDate");
            }}
          />
          <button type='button' className='baseButton mainButton' onClick={() => navigate("/create")}>
            Создать встречу
          </button>
        </aside>

        <section className={styles.Home__Content}>
          <div className={styles.Home__Tabs}>
            <button
              type='button'
              className={`${styles.Home__Tab} ${tab === "meetings" ? styles.Home__Tab_active : ""}`}
              onClick={() => setTab("meetings")}
            >
              Мои встречи
            </button>
            <button
              type='button'
              className={`${styles.Home__Tab} ${tab === "history" ? styles.Home__Tab_active : ""}`}
              onClick={() => setTab("history")}
            >
              История
            </button>
          </div>

          {tab === "meetings" ? (
            <>
              <div className={styles.Home__Filters}>
                {(
                  [
                    ["all", "Все"],
                    ["today", "Сегодня"],
                    ["byDate", "По дате"],
                    ["noTime", "Без времени"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type='button'
                    className={`${styles.Home__Chip} ${dateFilter === id ? styles.Home__Chip_active : ""}`}
                    onClick={() => setDateFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.Home__Filters}>
                {(
                  [
                    ["all", "Все роли"],
                    ["owner", "Я создатель"],
                    ["participant", "Я участник"],
                    ["observer", "Я наблюдатель"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type='button'
                    className={`${styles.Home__Chip} ${roleFilter === id ? styles.Home__Chip_active : ""}`}
                    onClick={() => setRoleFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {tab === "history" ? (
            <p className={styles.Home__Empty}>История появится, когда встречам можно будет назначать итоговое время</p>
          ) : isLoading ? (
            <p className={styles.Home__Empty}>Загружаем встречи…</p>
          ) : isError ? (
            <p className={styles.Home__Empty}>
              Не получилось загрузить встречи. После деплоя бэкенда в ветку dev список появится сам.
            </p>
          ) : grouped.length === 0 ? (
            <p className={styles.Home__Empty}>
              {user?.first_name}, пока нет встреч в этом фильтре. Создай первую или открой ссылку.
            </p>
          ) : (
            grouped.map(([day, items]) => (
              <div key={day} className={styles.Home__Group}>
                <h2 className={styles.Home__GroupTitle}>{formatGroupTitle(day === "none" ? "" : day)}</h2>
                {items.map(meeting => (
                  <div key={meeting.hash} className={styles.Home__Card}>
                    <button
                      type='button'
                      className={styles.Home__CardBody}
                      onClick={() => navigate(`/meet/${meeting.hash}`)}
                    >
                      <span className={styles.Home__CardName}>{meeting.name}</span>
                      <span className={styles.Home__CardMeta}>
                        {meeting.duration || "Время не указано"} · {ROLE_LABEL[meeting.role]}
                      </span>
                    </button>
                    {meeting.link ? (
                      <a
                        className={`${styles.Home__Join} baseButton mainButton`}
                        href={meeting.link}
                        target='_blank'
                        rel='noreferrer'
                      >
                        Подключиться
                      </a>
                    ) : null}
                    <button
                      type='button'
                      className={styles.Home__CardOpen}
                      aria-label={`Открыть встречу ${meeting.name}`}
                      onClick={() => navigate(`/meet/${meeting.hash}`)}
                    >
                      <Arrow className={styles.Home__CardArrow} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>
      </div>
    </Container>
  );
};

const HomeCalendar = ({
  month,
  markedDays,
  selectedDay,
  onMonthChange,
  onSelectDay,
}: {
  month: Date;
  markedDays: Set<string>;
  selectedDay: string | null;
  onMonthChange: (next: Date) => void;
  onSelectDay: (day: string) => void;
}) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );

  return (
    <div className={styles.HomeCalendar}>
      <div className={styles.HomeCalendar__Header}>
        <button
          type='button'
          aria-label='Предыдущий месяц'
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          <Arrow className={styles.HomeCalendar__ArrowLeft} />
        </button>
        <span>{monthTitle(month)}</span>
        <button
          type='button'
          aria-label='Следующий месяц'
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          <Arrow />
        </button>
      </div>
      <div className={styles.HomeCalendar__Week}>
        {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.HomeCalendar__Grid}>
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />;
          }
          const key = `${year}-${`${monthIndex + 1}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
          const isSelected = selectedDay === key;
          const isMarked = markedDays.has(key);
          return (
            <button
              key={key}
              type='button'
              className={`${styles.HomeCalendar__Day} ${isSelected ? styles.HomeCalendar__Day_selected : ""} ${isMarked && !isSelected ? styles.HomeCalendar__Day_marked : ""}`}
              onClick={() => onSelectDay(key)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
