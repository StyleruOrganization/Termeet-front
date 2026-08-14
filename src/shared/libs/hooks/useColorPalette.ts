const HEATMAP_COLORS = [
  {
    color: "var(--semantics-blue-50)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-100)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-200)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-300)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-400)",
    hoverColor: "var(--semantics-blue-950)",
  },
  {
    color: "var(--semantics-blue-500)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-600)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-700)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-800)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-900)",
    hoverColor: "var(--semantics-blue-50)",
  },
  {
    color: "var(--semantics-blue-950)",
    hoverColor: "var(--semantics-blue-50)",
  },
];

const PALETTE_LAST = HEATMAP_COLORS.length - 1;

interface IUseColorPalette {
  /**
   * Кол-во людей проголосовавших за текущий слот
   **/
  countSelectPerson: number;

  /**
   * Кол-во всех людей
   **/
  totalPersons: number;
}

export const useColorPalette = ({ countSelectPerson, totalPersons }: IUseColorPalette) => {
  if (totalPersons <= 0 || countSelectPerson <= 0) {
    return {
      color: undefined,
      hoverColor: undefined,
    };
  }

  const ratio = Math.min(1, countSelectPerson / totalPersons);
  const index = Math.min(PALETTE_LAST, Math.max(0, Math.round(ratio * PALETTE_LAST)));

  return HEATMAP_COLORS[index];
};
