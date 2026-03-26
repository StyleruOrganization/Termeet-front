import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { MeetQueries } from "@/entities/Meet";

const variablesColors = [
  {
    color: "var(--light-semantics-dark-blue-default)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-dark-blue-hover)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-active)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-hover)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-main)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },
  {
    color: "var(--light-semantics-blue-500)",
    borderColor: "var(--light-semantics-light-blue-disabled)",
  },

  {
    color: "var(--light-semantics-blue-400)",
    borderColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-active)",
    borderColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-hover)",
    borderColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-default)",
    borderColor: "var(--light-semantics-dark-blue-default)",
  },
  {
    color: "var(--light-semantics-light-blue-disabled)",
    borderColor: "var(--light-semantics-dark-blue-default)",
  },
];

interface IUseColorPalette {
  /**
   * Кол-во людей проголосовавших за текущий слот
   **/
  countSelectPerson: number;
}

export const useColorPalette = ({ countSelectPerson }: IUseColorPalette) => {
  const { hash = "" } = useParams();
  const { data: users = [] } = useQuery({
    ...MeetQueries.meet(hash),
    select: data => data.users,
  });

  const countAllPeople = users.length;
  const avaliableColors = variablesColors.slice(0, countAllPeople);
  return avaliableColors[(countSelectPerson / countAllPeople) * avaliableColors.length];
};
