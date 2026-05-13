import kirillCv from "@assets/cvs/Frontend-developer.pdf";
import GmailIcon from "@assets/icons/gmail.svg";
import TermeetIcon from "@assets/icons/logo.svg";
import YandexMailIcon from "@assets/icons/yandex-mail.svg";
import artyomPhoto from "@assets/team/artyom.png";
import danekPhoto from "@assets/team/danek.png";
import dimaPhoto from "@assets/team/diman.png";
import kirillPhoto from "@assets/team/kirill.png";
import kolyaPhoto from "@assets/team/kolya.png";
import kseniaMPhoto from "@assets/team/kseniam.png";
import kseniaShPhoto from "@assets/team/kseniash.png";
import { generateTimeOptions } from "@shared/libs/times/generateTimeOptions";

export const MOCK_PEOPLES = ["Дмитрий Лобанев", "Кирилл Белоусов", "Артем Шевчук", "Ламин Ямаль"];
export const NOTIFICATIONS = [
  {
    title: "Яндекс Почта",
    description: "Дейлик начнется через 15 минут. Подключиться можно по ссылке",
    time: "9:41 AM",
    icon: YandexMailIcon,
  },
  {
    title: "Google Mail",
    description: "«Дейлик команды разработки»: Назначена встреча на 4 мая, 10:30–11:00",
    time: "9:42 AM",
    icon: GmailIcon,
  },
  {
    title: "Termeet",
    description: "«Разбор инцидентов»: Проголосовали все участники, теперь можно выбрать итоговое время для встречи",
    time: "9:43 AM",
    icon: TermeetIcon,
  },
];

export const MEETS = [
  {
    title: "Дейлик Termeet",
    time: "10:00 - 11:00",
  },
  {
    title: "PBR по фиче",
    time: "13:00 - 13:30",
  },
  {
    title: "Встреча с менти",
    time: "18:45 - 19:45",
  },
];

const MOCK_CALENDAR = {
  "13 мая": [1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 3, 2],
  "14 мая": [2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 9, 8],
  "15 мая": [2, 3, 3, 4, 5, 6, 6, 7, 7, 7, 6, 6],
  "16 мая": [1, 2, 2, 3, 4, 4, 5, 5, 6, 5, 5, 4],
  "17 мая": [2, 2, 3, 3, 4, 5, 5, 6, 6, 6, 5, 5],
  "18 мая": [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 3],
};

const flattenDaysForGrid = () => {
  const calendarValues = Object.values(MOCK_CALENDAR);
  const daysLength = calendarValues.length;
  const lengthCellsPerDay = calendarValues[0].length;

  const res = [];
  for (let i = 0; i < lengthCellsPerDay; i++) {
    for (let j = 0; j < daysLength; j++) {
      res.push(calendarValues[j][i]);
    }
  }

  return res;
};

export const CELLS = flattenDaysForGrid();

export const DATES_OPTIONS = Object.keys(MOCK_CALENDAR);
export const TIME_OPTIONS = generateTimeOptions("10:00", "16:00", 60).slice(0, -1);

export const CHAT_ANIMATION_STAGGER = 400;
export const NOTIFICATION_ANIMATION_STAGGER = 300;
export const CHAT_TOTAL_DURATION = 3 * CHAT_ANIMATION_STAGGER;
export const NOTIFICATIONS_TOTAL_DURATION = 3 * NOTIFICATION_ANIMATION_STAGGER;

export const TEAM_MEMBERS = [
  {
    name: "Тимофей Морозов",
    role: "Product manager",
    photo: kirillPhoto,
    telegramContact: "https://t.me/Kotletkad",
    description:
      "Я ебаная машина, которая пиздячит код налево и направо. Меня не остановить ни работой в Яндексе, ни загрузкой, мне похуй. Я газую",
    email: "",
  },
  {
    name: "Дима Лобанев",
    role: "Руководитель разработки",
    photo: dimaPhoto,
    telegramContact: "https://t.me/Lobaaashik",
    description:
      "Раньше был КМС по биатлону, теперь КМС по код ревью. Много бегаю, вкусно готовлю и слежу, чтобы разработчики писали termeet",
    email: "",
  },
  {
    name: "Артем Шевчук",
    role: "Арт-директор",
    photo: artyomPhoto,
    telegramContact: "https://t.me/ShevchukArtyom",
    description:
      "Я если честно в рот ебал этот ваш дизайн, но вы пищите если нужно что-то кайфовое. Я норм сделаю. Не шик, но сделаю",
    email: "working.aashevchuk@gmail.com",
    portfolioLink: "https://shevchuk.tech/",
  },
  {
    name: "Кирилл Белоусов",
    role: "Frontend-developer",
    photo: kirillPhoto,
    telegramContact: "https://t.me/kiryshka2205",
    description:
      "Выдаю идеальный код круглосуточно, живу футболом по обе стороны экрана и искренне верю, что еда должна появляться дома исключительно через API доставки.",
    email: "kipabelousov@edu.hse.ru",
    cv: kirillCv,
  },
  {
    name: "Ксюша Макаева",
    role: "Product designer",
    photo: kseniaMPhoto,
    telegramContact: "https://t.me/mcksesh",
    description:
      "Я ебаная машина, которая пиздячит код налево и направо. Меня не остановить ни работой в Яндексе, ни загрузкой, мне похуй. Я газую",
    email: "makaevaks17@gmail.com",
  },

  {
    name: "Даня Маклаков",
    role: "Backend-developer",
    photo: danekPhoto,
    telegramContact: "https://t.me/d10110101",
    description:
      "Вайбую по жизни, пью вкусный чай, поднимаю Docker с третьего раза и искренне верю, что Nginx как-нибудь настроится сам.",
    email: "daniilmaklakov36@gmail.com",
  },
  {
    name: "Ксюша Шурыгина",
    role: "Product designer",
    photo: kseniaShPhoto,
    telegramContact: "https://t.me/airsenya",
    description:
      "Я ебаная машина, которая пиздячит код налево и направо. Меня не остановить ни работой в Яндексе, ни загрузкой, мне похуй. Я газую",
    email: "",
  },
  {
    name: "Коля Красавин",
    role: "Frontend-developer",
    photo: kolyaPhoto,
    telegramContact: "https://t.me/kolyanikolka",
    description:
      "Я ебаная машина, которая пиздячит код налево и направо. Меня не остановить ни работой в Яндексе, ни загрузкой, мне похуй. Я газую",
    email: "nik.krasavin.06@gmail.com",
  },
];
