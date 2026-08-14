import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getMyMeetingsRequest, useSessionStore, type IUserMeeting, type UserMeetingRole } from "@/entities/User";
import { LOCALE_BCP, parseLocale, useTranslation } from "@/shared/i18n";
import { Container } from "@/shared/ui";
import Arrow from "@assets/icons/arrow.svg";
import styles from "./Home.module.css";

type DateFilter = "all" | "today" | "byDate";
type RoleFilter = "all" | UserMeetingRole;
type HomeTab = "meetings" | "history";

const ROLE_LABEL_KEY: Record<UserMeetingRole, string> = {
  owner: "home.roleOwner",
  participant: "home.roleParticipant",
  observer: "home.roleObserver",
  invited: "home.roleInvited",
};

const toDayKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const firstRangeDay = (meeting: IUserMeeting) => meeting.dataRange?.[0]?.[0]?.slice(0, 10) ?? "";

const peopleWordKey = (count: number, locale: string) => {
  if (locale !== "ru") {
    return count === 1 ? "home.people1" : "home.people5";
  }
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return "home.people1";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "home.people2";
  }
  return "home.people5";
};

export const Home = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = LOCALE_BCP[parseLocale(i18n.language)];
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
    return meetings.filter(meeting => {
      const isFinal = Boolean(meeting.hasFinal);
      if (tab === "history" && !isFinal) {
        return false;
      }
      if (tab === "meetings" && isFinal) {
        return false;
      }
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

  const formatGroupTitle = (isoDay: string) => {
    if (!isoDay || isoDay === "none") {
      return t("home.noDate");
    }
    const date = new Date(`${isoDay}T00:00:00`);
    const weekdayKey = ((date.getDay() + 6) % 7) + 1;
    return `${date.toLocaleDateString(dateLocale, { day: "numeric", month: "long" })}, ${t(`week.${weekdayKey}`)}`;
  };

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
              if (selectedDay === day) {
                setSelectedDay(null);
                setDateFilter("all");
                return;
              }
              setSelectedDay(day);
              setDateFilter("byDate");
            }}
          />
          <button type='button' className='baseButton mainButton' onClick={() => navigate("/create")}>
            {t("home.create")}
          </button>
        </aside>

        <section className={styles.Home__Content}>
          <div className={styles.Home__Tabs}>
            <button
              type='button'
              className={`${styles.Home__Tab} ${tab === "meetings" ? styles.Home__Tab_active : ""}`}
              onClick={() => setTab("meetings")}
            >
              {t("home.meetings")}
            </button>
            <button
              type='button'
              className={`${styles.Home__Tab} ${tab === "history" ? styles.Home__Tab_active : ""}`}
              onClick={() => setTab("history")}
            >
              {t("home.history")}
            </button>
          </div>

          <div className={styles.Home__Filters}>
            {(
              [
                ["all", "home.all"],
                ["today", "home.today"],
                ["byDate", "home.byDate"],
              ] as const
            ).map(([id, labelKey]) => (
              <button
                key={id}
                type='button'
                className={`${styles.Home__Chip} ${dateFilter === id ? styles.Home__Chip_active : ""}`}
                onClick={() => setDateFilter(id)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          <div className={styles.Home__Filters}>
            {(
              [
                ["all", "home.allRoles"],
                ["owner", "home.owner"],
                ["participant", "home.participant"],
                ["observer", "home.observer"],
                ["invited", "home.invited"],
              ] as const
            ).map(([id, labelKey]) => (
              <button
                key={id}
                type='button'
                className={`${styles.Home__Chip} ${roleFilter === id ? styles.Home__Chip_active : ""}`}
                onClick={() => setRoleFilter(id)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {tab === "history" && grouped.length === 0 && !isLoading && !isError ? (
            <p className={styles.Home__Empty}>{t("home.historyEmpty")}</p>
          ) : isLoading ? (
            <p className={styles.Home__Empty}>{t("home.loading")}</p>
          ) : isError ? (
            <p className={styles.Home__Empty}>{t("home.loadError")}</p>
          ) : grouped.length === 0 ? (
            <p className={styles.Home__Empty}>{t("home.emptyFilter", { name: user?.first_name ?? "" })}</p>
          ) : (
            grouped.map(([day, items]) => (
              <div key={day} className={styles.Home__Group}>
                <h2 className={styles.Home__GroupTitle}>{formatGroupTitle(day)}</h2>
                {items.map(meeting => (
                  <div key={meeting.hash} className={styles.Home__Card}>
                    <button
                      type='button'
                      className={styles.Home__CardBody}
                      onClick={() => navigate(`/meet/${meeting.hash}`)}
                    >
                      <span className={styles.Home__CardName}>{meeting.name}</span>
                      <span className={styles.Home__CardMeta}>
                        {meeting.hasFinal ? t("home.scheduled") : t("home.waiting")} · {t(ROLE_LABEL_KEY[meeting.role])}
                        {meeting.duration ? ` · ${meeting.duration}` : ""}
                      </span>
                    </button>
                    <PeopleSnippet names={meeting.participantNames ?? []} count={meeting.participantCount ?? 0} />
                    {meeting.link ? (
                      <a
                        className={`${styles.Home__Join} baseButton mainButton`}
                        href={meeting.link}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {t("home.join")}
                      </a>
                    ) : null}
                    <button
                      type='button'
                      className={styles.Home__CardOpen}
                      aria-label={t("home.openMeet", { name: meeting.name })}
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

const PeopleSnippet = ({ names, count }: { names: string[]; count: number }) => {
  const { t, i18n } = useTranslation();
  const shown = count || names.length;
  if (!shown) {
    return <span className={styles.Home__PeopleEmpty}>{t("home.noPeople")}</span>;
  }

  return (
    <div className={styles.Home__People} tabIndex={0}>
      <span className={styles.Home__PeopleToggle}>
        {shown} {t(peopleWordKey(shown, parseLocale(i18n.language)))}
      </span>
      {names.length > 0 ? (
        <ul className={styles.Home__PeopleList}>
          {names.map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
    </div>
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
  const { t, i18n } = useTranslation();
  const dateLocale = LOCALE_BCP[parseLocale(i18n.language)];
  const todayKey = toDayKey(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday ? null : index - firstWeekday + 1,
  );
  const monthLabel = month.toLocaleDateString(dateLocale, { month: "long", year: "numeric" }).replace(" г.", "");

  return (
    <div className={styles.HomeCalendar}>
      <div className={styles.HomeCalendar__Header}>
        <button
          type='button'
          aria-label={t("home.prevMonth")}
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          <Arrow className={styles.HomeCalendar__ArrowLeft} />
        </button>
        <span>{monthLabel}</span>
        <button
          type='button'
          aria-label={t("home.nextMonth")}
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          <Arrow />
        </button>
      </div>
      <div className={styles.HomeCalendar__Week}>
        {([1, 2, 3, 4, 5, 6, 7] as const).map(day => (
          <span key={day}>{t(`week.${day}`)}</span>
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
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type='button'
              className={`${styles.HomeCalendar__Day} ${isSelected ? styles.HomeCalendar__Day_selected : ""} ${isToday && !isSelected ? styles.HomeCalendar__Day_today : ""}`}
              onClick={() => onSelectDay(key)}
            >
              {day}
              {isMarked ? <span className={styles.HomeCalendar__Dot} /> : null}
            </button>
          );
        })}
      </div>
      <p className={styles.HomeCalendar__Hint}>
        <span className={styles.HomeCalendar__HintDot} aria-hidden />
        {t("home.dotHint")}
      </p>
    </div>
  );
};
