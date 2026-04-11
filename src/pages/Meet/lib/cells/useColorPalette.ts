import { useMeetStore } from "@/entities/Meet";

const variablesColors = [
  {
    color: "var(--semantics-blue-950)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-900)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-800)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-700)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-600)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-500)",
    hoverColor: "var(--semantics-blue-50)",
  },

  {
    color: "var(--semantics-blue-400)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-300)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-200)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-100)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-50)",
    hoverColor: "var(--semantics-blue-950)",
  },
];

interface IUseColorPalette {
  /**
   * Кол-во людей проголосовавших за текущий слот
   **/
  countSelectPerson: number;
}

export const useColorPalette = ({ countSelectPerson }: IUseColorPalette) => {
  const users = useMeetStore(store => store.users);

  if (!users || users.length == 0) {
    return {
      color: undefined,
      hoverColor: undefined,
    };
  }
  const countAllPeople = users.length;
  const avaliableColors = variablesColors.slice(0, countAllPeople).reverse();
  return avaliableColors[Math.max((countSelectPerson / countAllPeople) * avaliableColors.length - 1, 0)];
};
