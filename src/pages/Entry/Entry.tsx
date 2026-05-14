import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { isTouchDevice } from "@/shared/libs";
import { useLoginModalStore } from "@/shared/libs/store/useLoginModalStore";
import { Container } from "@/shared/ui/Container/Container";
import { FeedbackForm } from "@/widgets/FeedbackForm/FeedbackForm";
import Arrow from "@assets/icons/arrow.svg";
import ChatMsgArrow from "@assets/icons/chat-msg-arrow.svg";
import GmailIcon from "@assets/icons/gmail.svg";
import TermeetLogo from "@assets/icons/logo.svg";
import OutlukIcon from "@assets/icons/outluk.svg";
import Pencil from "@assets/icons/pencil.svg";
import StyleruLogo from "@assets/icons/styleru-logo.svg";
import TelemostIcon from "@assets/icons/telemost.svg";
import TgIcon from "@assets/icons/tg.svg";
import TrashBinIcon from "@assets/icons/trash-bin.svg";
import YandexCalendarIcon from "@assets/icons/yandex-calendar.svg";
import { useToastStore } from "@features/ToastContainer";
import { useInView } from "@shared/libs/hooks/useinView";
import styles from "./Entry.module.css";
import {
  CHAT_ANIMATION_STAGGER,
  CHAT_TOTAL_DURATION,
  NOTIFICATION_ANIMATION_STAGGER,
  NOTIFICATIONS_TOTAL_DURATION,
  TIME_OPTIONS,
  DATES_OPTIONS,
  NOTIFICATIONS,
  CELLS,
  MOCK_PEOPLES,
  MEETS,
  TEAM_MEMBERS,
} from "./lib/consts/consts";
import { useActiveSectionStore } from "./lib/store/useActiveSection";
import { Calendar } from "./ui/Calendar/Calendar";
import { Card } from "./ui/Card/Card";
import { Notification } from "./ui/Notification/Notification";
import { TeamMemberCard } from "./ui/TeamMemberCard/TeamMemberCard";

const getMessageDelay = (index: number) => index * CHAT_ANIMATION_STAGGER;

export const Entry = () => {
  const [reasonCardWidth, setReasonCardWidth] = useState<number | "auto">(0);
  const [advantageCardWidth, setAdvantageCardWidth] = useState<number | "auto">(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [expandUserList, setExpandUserList] = useState(false);
  const [hoveredUser, setHoveredUser] = useState("");
  const openLoginModal = useLoginModalStore(state => state.open);
  const addToast = useToastStore(state => state.addToast);
  const setActiveSection = useActiveSectionStore(state => state.setActiveSection);

  const navigate = useNavigate();

  const reasonContainerRef = useRef<HTMLDivElement>(null);
  const advantagesContainerRef = useRef<HTMLDivElement>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const manageContainerRef = useRef<HTMLDivElement>(null);
  const calendarAdvRef = useRef<HTMLDivElement>(null);

  const sectionFeauturesRef = useRef<HTMLDivElement>(null);
  const sectionAdvantagesRef = useRef<HTMLDivElement>(null);
  const sectionTeamRef = useRef<HTMLDivElement>(null);

  const { isVisible: sectionFeauturesInView } = useInView(sectionFeauturesRef, 0.3);
  const { isVisible: sectionAdvantagesInView } = useInView(sectionAdvantagesRef, 0.3);
  const { isVisible: sectionTeamInView } = useInView(sectionTeamRef, 0.3);
  const { isVisible: chatInView, hasBeenSeen: chatHasBeenSeen } = useInView(chatRef, 0.1);
  const { isVisible: notificationsInView, hasBeenSeen: notificationsHasBeenSeen } = useInView(notificationsRef, 1);
  const { hasBeenSeen: calendarHasBeenSeen } = useInView(calendarRef);
  const { hasBeenSeen: manageContainerHasBeenSeen } = useInView(manageContainerRef, 0.5);
  const { hasBeenSeen: calendarAdvHasBeenSeen } = useInView(calendarAdvRef, 0.5);

  const getNotificationDelay = (position: number, total: number) => {
    const chatOffset = chatInView && notificationsInView ? CHAT_TOTAL_DURATION : 0;
    return chatOffset + (total - 1 - position) * NOTIFICATION_ANIMATION_STAGGER;
  };

  const isTouch = isTouchDevice();

  const calendarTooltipDelay = useMemo(() => {
    if (chatInView && notificationsInView) {
      return CHAT_TOTAL_DURATION + NOTIFICATIONS_TOTAL_DURATION;
    }
    return 400;
  }, [chatInView, notificationsInView]);

  useEffect(() => {
    const calculateReasonContainerWidth = () => {
      if (!reasonContainerRef.current) return;

      const visibleWidth = reasonContainerRef.current.clientWidth;
      const fullWidth = reasonContainerRef.current.scrollWidth;
      const isScrollable = fullWidth > visibleWidth;

      if (isScrollable) {
        const VISIBLE_CARDS = window.innerWidth > 810 ? 2.5 : 1.2;
        const targetColumnWidth = Math.round((visibleWidth - 32) / VISIBLE_CARDS);
        setReasonCardWidth(targetColumnWidth);
      } else {
        setReasonCardWidth("auto");
      }
    };

    const calculateAdvantagesContainerWidth = () => {
      if (!advantagesContainerRef.current) return;

      const visibleWidth = advantagesContainerRef.current.clientWidth;
      const fullWidth = advantagesContainerRef.current.scrollWidth;
      const isScrollable = fullWidth > visibleWidth;

      if (isScrollable) {
        const VISIBLE_CARDS = 1.05;
        const targetColumnWidth = Math.round((visibleWidth - 32) / VISIBLE_CARDS);
        setAdvantageCardWidth(targetColumnWidth);
      } else {
        setAdvantageCardWidth("auto");
      }
    };

    calculateReasonContainerWidth();
    calculateAdvantagesContainerWidth();

    const resizeObserver = new ResizeObserver(() => {
      calculateReasonContainerWidth();
      calculateAdvantagesContainerWidth();
    });

    if (reasonContainerRef.current) {
      resizeObserver.observe(reasonContainerRef.current);
    }

    if (advantagesContainerRef.current) {
      resizeObserver.observe(advantagesContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (manageContainerHasBeenSeen) {
      timer = setTimeout(() => {
        setExpandedDesc(true);
        setExpandUserList(true);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [manageContainerHasBeenSeen]);

  useEffect(() => {
    if (sectionAdvantagesInView) {
      setActiveSection("advantages");
    } else if (sectionFeauturesInView) {
      setActiveSection("features");
    } else if (sectionTeamInView) {
      setActiveSection("team");
    } else {
      setActiveSection(null);
    }
  }, [sectionAdvantagesInView, sectionFeauturesInView, sectionTeamInView, setActiveSection]);

  return (
    <div className={styles.EntryPage}>
      <div className={styles.EntryPage__intro}>
        <div className={styles.EntryPage__intro__content}>
          <h1>Планируй встречи легко</h1>
          <p>
            Создайте событие, поделитесь ссылкой и узнайте,
            <br /> когда все участники свободны
          </p>
        </div>
        <div className={styles.EntryPage__groupButtons}>
          <button
            className='baseButton mainButton'
            onClick={() => {
              navigate("/create");
            }}
          >
            Создать встречу
          </button>
          <button className='baseButton outlineButton' onClick={openLoginModal}>
            Войти или зарегистрироваться
          </button>
        </div>
        {/* Gradients */}
        <div className={styles.EntryPage__litleGrd}></div>
        <div className={styles.EntryPage__bigGrd}></div>
      </div>

      <Container className={styles.EntryPage__Container}>
        <section
          id='features'
          style={
            {
              "--reason-card-min-width": `${reasonCardWidth}px`,
            } as React.CSSProperties
          }
          className={styles.EntryPage__Reasons}
          ref={sectionFeauturesRef}
        >
          <h2>
            Почему встречи удобнее <br />
            организовывать в Termeet?
          </h2>

          <div ref={reasonContainerRef} className={styles.EntryPage__Reasons__Cards}>
            <Card
              title='Быстрое создание встречи'
              description='Организуйте встречи меньше чем за минуту, вместо 40 сообщений в чате'
              scrollSnapType='start'
              type='reason'
            >
              <div ref={chatRef} className={styles.EntryPage__Chat}>
                <div
                  className={`${styles.ChatContainer} ${chatHasBeenSeen ? styles.ChatMsg_visible : ""}`}
                  style={{ "--chat-msg-delay": `${getMessageDelay(0)}ms` } as React.CSSProperties}
                >
                  <div className={styles.ChatContainer__Msg__Author}>O</div>
                  <div className={styles.ChatContainer__Msg__Content}>
                    <span>Организатор</span>
                    <span>Коллеги, здесь собираем слоты на встречу:</span>
                    <span className={styles.ChatContainer__Msg__Content__Link}>
                      https://termeet.tech/meet/ab0b9ee5-9e58-4507-9f52-fbdd531ec3eb
                    </span>

                    <ChatMsgArrow />
                  </div>
                </div>
                <div
                  className={`${styles.ChatContainer} ${styles.ChatContainer_blue} ${chatHasBeenSeen ? styles.ChatMsg_visible : ""}`}
                  style={{ "--chat-msg-delay": `${getMessageDelay(1)}ms` } as React.CSSProperties}
                >
                  <div className={styles.ChatContainer__Msg__Content}>
                    <span>Вы</span>
                    <span>Заполнил, спасибо</span>
                    <ChatMsgArrow />
                  </div>
                  <div className={styles.ChatContainer__Msg__Author}>В</div>
                </div>
                <div
                  className={`${styles.ChatContainer} ${styles.ChatMsg} ${chatHasBeenSeen ? styles.ChatMsg_visible : ""}`}
                  style={{ "--chat-msg-delay": `${getMessageDelay(2)}ms` } as React.CSSProperties}
                >
                  <div className={styles.ChatContainer__Msg__Author}>O</div>
                  <div className={styles.ChatContainer__Msg__Content}>
                    <span>Организатор</span>
                    <span>Отлично</span>
                    <ChatMsgArrow />
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title='Напомним везде, где вам удобно'
              description='Поддержка Telegram, Яндекс и Google — участники не пропустят встречу'
              scrollSnapType='start'
              type='reason'
            >
              <div ref={notificationsRef} className={styles.EntryPage__Notifications}>
                {NOTIFICATIONS.map((n, i) => (
                  <Notification
                    key={n.title}
                    title={n.title}
                    description={n.description}
                    time={n.time}
                    position={i}
                    total={NOTIFICATIONS.length}
                    animationDelay={getNotificationDelay(i, NOTIFICATIONS.length)}
                    inView={notificationsHasBeenSeen}
                    Icon={
                      <>
                        {i === 2 ? (
                          <div className={styles.TermeetNotificationIcon}>
                            <n.icon />
                            <TgIcon className={styles.TermeetNotificationIcon__TgIcon} />
                          </div>
                        ) : (
                          <n.icon />
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            </Card>

            <Card
              title='Подбор удобного времени'
              description='Порекомендуем, в какое время стоит назначить встречу'
              scrollSnapType='end'
              type='reason'
            >
              <div ref={calendarRef}>
                <Calendar
                  times={TIME_OPTIONS}
                  dates={DATES_OPTIONS}
                  cells={CELLS}
                  tooltipDelay={calendarTooltipDelay}
                  inView={calendarHasBeenSeen}
                />
              </div>
            </Card>
          </div>
        </section>

        <section
          id='advantages'
          style={
            {
              "--advantage-card-min-width": `${advantageCardWidth == "auto" ? "auto" : advantageCardWidth + "px"}`,
            } as React.CSSProperties
          }
          className={styles.EntryPage__Advantages}
          ref={sectionAdvantagesRef}
        >
          <h2>Преимущества Termeet</h2>

          <div ref={advantagesContainerRef} className={styles.EntryPage__Advantages__Cards}>
            <Card
              title='Интеграция с Яндекс Календарем и Телемост'
              description='Больше не нужно создавать звонок отдельно, копировать ссылку и рассылать её вручную. Termeet позволяет уведомлять о финальном времени и создает встречу в Телемосте'
              scrollSnapType='start'
              type='advantage'
            >
              <div className={styles.EntryPage__Advantages__Icons}>
                <YandexCalendarIcon className={styles.EntryPage__Advantages__IconsYandex} />
                <TelemostIcon className={styles.EntryPage__Advantages__IconsTelemost} />

                <div className={styles.EntryPage__Advantages__Icons__Grd}></div>
              </div>
            </Card>
            <Card
              title='Удобное управление встречей'
              description='Можно изменить название встречи или ее описание, управлять списком участников, редактировать доступное время и уведомлять участников о финальном времени'
              scrollSnapType='start'
              type='advantage'
            >
              <div ref={manageContainerRef} className={styles.EntryPage__Advantages__ManageContainer}>
                <div className={`${styles.MeetHeader} ${expandedDesc ? styles.MeetHeader__expanded : ""}`}>
                  <div className={styles.MeetHeader__Info}>
                    <span className={styles.MeetHeader__Info__Title}>Discovery</span>
                    <span className={styles.MeetHeader__Info__Duration}>1 час</span>
                    <button className={styles.MeetHeader__Info__Button}>
                      <Pencil />
                    </button>
                    <button
                      className={styles.MeetHeader__Info__Button + " " + styles.MeetHeader__Info__ExpandButton}
                      onClick={() => {
                        setExpandedDesc(!expandedDesc);
                      }}
                    >
                      <Arrow />
                    </button>
                  </div>
                  <div className={styles.MeetHeader__desc}>
                    Встреча команды по обсуждению новой концепции продукта. Поговорим о ключевых фичах следующего
                    релиза, разберём фидбек от польской. Будет весело и продуктивно!
                  </div>
                  <a className={styles.MeetHeader__link}>Ссылка на встречу</a>
                </div>

                <div className={`${styles.MeetPeoples} ${expandUserList ? styles.MeetPeoples__expanded : ""}`}>
                  <div className={styles.MeetPeoples__Title}>
                    <h3>
                      Участники: <span className={styles.MeetPeoples__Count}>{MOCK_PEOPLES.length}</span>
                    </h3>
                    <button className={styles.MeetHeader__Info__Button}>
                      <Pencil />
                    </button>
                    <button
                      onClick={() => setExpandUserList(!expandUserList)}
                      className={styles.MeetPeoples__ExpandButton}
                    >
                      <Arrow />
                    </button>
                  </div>
                  <div className={styles.MeetPeoples__Users__Container}>
                    {MOCK_PEOPLES.map(user => {
                      const shouldDim = hoveredUser && hoveredUser !== user;
                      return (
                        <span
                          key={user}
                          onPointerMove={() => {
                            if (!isTouch) {
                              setHoveredUser(user);
                            }
                          }}
                          onPointerLeave={() => {
                            if (!isTouch) {
                              setHoveredUser("");
                            }
                          }}
                          style={{
                            color: shouldDim ? "var(--text-disabled)" : "var(--text-main)",
                          }}
                        >
                          {user}
                          <TrashBinIcon className={styles.MeetPeoples__TrashBinIcon} />
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title='Управление календарем и историей встреч'
              description='На главной странице можно подключить уведомления, вести календарь, который синхронизируется с Яндекс.Календарем, Outlook, и Google, а также смотреть историю прошлых и будущих встреч'
              type='advantage'
              scrollSnapType='end'
            >
              <div ref={calendarAdvRef} className={styles.Calendar_Adv}>
                <div
                  className={`${styles.Calendar_Adv__IconsWrapper} ${calendarAdvHasBeenSeen ? styles.Calendar_Adv__IconsWrapper_visible : ""}`}
                >
                  <YandexCalendarIcon />
                </div>
                <div
                  className={`${styles.Calendar_Adv__IconsWrapper} ${calendarAdvHasBeenSeen ? styles.Calendar_Adv__IconsWrapper_visible : ""}`}
                >
                  <OutlukIcon />
                </div>
                <div
                  className={`${styles.Calendar_Adv__IconsWrapper} ${calendarAdvHasBeenSeen ? styles.Calendar_Adv__IconsWrapper_visible : ""}`}
                >
                  <GmailIcon />
                </div>

                <div className={styles.CalendarMeets}>
                  <span className={styles.CalendarMeets__Title}>12 мая</span>
                  {MEETS.map(meet => {
                    return (
                      <div className={styles.CalendarMeets__Meet}>
                        <span className={styles.CalendarMeets__Meet__Title}>{meet.title}</span>
                        <span className={styles.CalendarMeets__Meet__Time}>{meet.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id='team-info' ref={sectionTeamRef}>
          <h2>Наша команда</h2>

          <div className={styles.TeamInfo__CardsSection}>
            {TEAM_MEMBERS.map((member, index) => (
              <TeamMemberCard
                style={{
                  "--animation-delay": `${index * NOTIFICATION_ANIMATION_STAGGER}ms`,
                }}
                className={styles.TeamInfo__Card}
                key={member.name}
                {...member}
              />
            ))}
          </div>
        </section>
      </Container>

      <footer id='feedback'>
        <Container>
          <div className={styles.EntryPage__Footer}>
            <div>
              <div className={styles.EntryPage__Footer__Logo}>
                <TermeetLogo />
                termeet
              </div>

              <div className={styles.EntryPage__Footer__Links}>
                <span onClick={openLoginModal} style={{ cursor: "pointer" }}>
                  Зарегистрироваться
                </span>
                <span style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                  Главная
                </span>
                <a href='#features'>Удобства</a>
                <a href='#advantages'>Преимущества</a>
                <a href='#team-info'>О нас</a>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    addToast({
                      id: "guide-coming-soon",
                      message: "Гайд скоро появится",
                      type: "info",
                    })
                  }
                >
                  Гайд
                </span>
                <a href='#feedback'>Обратная связь</a>
                <a href='#feedback'>Поддержка</a>
              </div>
            </div>
            <div className={styles.EntryPage__Footer__FeedbackFromWrapper}>
              <FeedbackForm />
            </div>
            <div
              onClick={() => window.open("https://styleru.org/", "_blank")}
              className={styles.EntryPage__Footer__Styleru}
            >
              <StyleruLogo />
              <span>Сделано в Стилеру</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
