import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router";
import { useShallow } from "zustand/shallow";
import { MeetQueries, useMeetContext } from "@/entities/Meet";
import { isMoreThan30Min } from "@shared/libs";
import { getCellIds } from "../cells/getCellsIds";

interface IFakeCells {
  isShow: boolean;
  isShowSeparator: boolean;
}

export const useColumnData = (date: string) => {
  const { hash } = useParams();
  const setSelectNewSell = useMeetContext(store => store.setSelectNewSell),
    isEditing = useMeetContext(store => store.isEditing),
    newSelectedSlots = useMeetContext(useShallow(store => store.newSelectedSlots.get(date))),
    hoveredUser = useMeetContext(store => store.hoveredUser);
  const { data: meetInfo } = useQuery(MeetQueries.meet(hash || ""));
  console.log("meetInfo in useColumnData", meetInfo, date);
  const columnData = meetInfo?.timeInfo.get(date);

  const cellIds = columnData?.timeRanges?.map(([startTime, endTime]) => {
    return getCellIds({ startTime, endTime, date });
  });

  const isShowBefore: IFakeCells = useMemo(() => {
    if (meetInfo?.timeRanges.length == (columnData?.timeRanges || []).length) {
      return { isShow: false, isShowSeparator: false };
    }
    const timeFirstRangeStart = meetInfo?.timeRanges[0]?.[0];
    const timeFirstRangeEnd = meetInfo?.timeRanges[0]?.[1];
    const res = { isShow: false, isShowSeparator: false };

    if (timeFirstRangeStart && timeFirstRangeEnd) {
      if (
        !columnData?.timeRanges.some(
          ([startTime, endTime]) => startTime === timeFirstRangeStart && endTime === timeFirstRangeEnd,
        )
      ) {
        res.isShow = true;

        if (
          columnData?.timeRanges.some(
            ([startTime]) => startTime !== timeFirstRangeEnd && isMoreThan30Min(timeFirstRangeEnd, startTime),
          )
        ) {
          res.isShowSeparator = true;
        }
      }
    }
    return res;
  }, [meetInfo?.timeRanges, columnData?.timeRanges]);

  const isShowAfter: IFakeCells = useMemo(() => {
    if (meetInfo?.timeRanges.length == (columnData?.timeRanges || []).length) {
      return { isShow: false, isShowSeparator: false };
    }
    const timeSecondRangeStart = meetInfo?.timeRanges[1]?.[0];
    const timeSecondRangeEnd = meetInfo?.timeRanges[1]?.[1];
    const res = { isShow: false, isShowSeparator: false };

    if (timeSecondRangeStart && timeSecondRangeEnd) {
      if (
        !columnData?.timeRanges.some(
          ([startTime, endTime]) => startTime === timeSecondRangeStart && endTime === timeSecondRangeEnd,
        )
      ) {
        res.isShow = true;

        if (
          columnData?.timeRanges.some(
            period => period[1] !== timeSecondRangeStart && isMoreThan30Min(period[1], timeSecondRangeStart),
          )
        ) {
          res.isShowSeparator = true;
        }
      }
    }

    return res;
  }, [meetInfo?.timeRanges, columnData?.timeRanges]);

  return useMemo(
    () => ({
      userSlots: columnData?.userSlots,
      cellIds,
      setSelectNewSell,
      isEditing,
      maxSelectCount: meetInfo?.maxSelectCount,
      newSelectedSlots,
      hoveredUser,
      isShowBefore,
      isShowAfter,
    }),
    [
      columnData,
      setSelectNewSell,
      isEditing,
      newSelectedSlots,
      hoveredUser,
      cellIds,
      isShowBefore,
      isShowAfter,
      meetInfo?.maxSelectCount,
    ],
  );
};
