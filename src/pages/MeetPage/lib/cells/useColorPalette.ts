import { useMeetStore } from "@/entities/Meet";

const variablesColors = [
  {
    color: "var(--light-semantics-dark-blue-default)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-dark-blue-hover)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-active)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-hover)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-main)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-500)",
    hoverColor: "var(--light-semantics-light-blue-disabled)",
  },

  {
    color: "var(--light-semantics-blue-400)",
    hoverColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-active)",
    hoverColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-hover)",
    hoverColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-default)",
    hoverColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-disabled)",
    hoverColor: "var(--light-semantics-dark-blue-default)",
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
