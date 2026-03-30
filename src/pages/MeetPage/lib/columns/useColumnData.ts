import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useMeetStore } from "@/entities/Meet";
import { getCellIds } from "../cells/getCellsIds";

interface IFakeCells {
  isShow: boolean;
}

export const useColumnData = (date: string) => {
  const setSelectNewSell = useMeetStore(store => store.setSelectNewSell),
    isEditing = useMeetStore(store => store.isEditing),
    newSelectedSlots = useMeetStore(useShallow(store => store.newSelectedSlots.get(date))),
    columnData = useMeetStore(useShallow(store => store.timeInfo.get(date))),
    timeRanges = useMeetStore(useShallow(store => store.timeRanges));

  console.log("columnData?.timeRanges", columnData?.timeRanges);

  const cellIds = columnData?.timeRanges?.map(([startTime, endTime]) => {
    return getCellIds({ startTime, endTime, date });
  });

  const isShowBefore: IFakeCells = useMemo(() => {
    if (timeRanges.length == (columnData?.timeRanges || []).length) {
      return { isShow: false };
    }
    const timeFirstRangeStart = timeRanges[0]?.[0];
    const timeFirstRangeEnd = timeRanges[0]?.[1];
    const res = { isShow: false };

    if (timeFirstRangeStart && timeFirstRangeEnd) {
      if (
        !columnData?.timeRanges.some(
          ([startTime, endTime]) => startTime === timeFirstRangeStart && endTime === timeFirstRangeEnd,
        )
      ) {
        res.isShow = true;
      }
    }
    return res;
  }, [timeRanges, columnData?.timeRanges]);

  const isShowAfter: IFakeCells = useMemo(() => {
    if (timeRanges.length == (columnData?.timeRanges || []).length) {
      return { isShow: false };
    }
    const timeSecondRangeStart = timeRanges[1]?.[0];
    const timeSecondRangeEnd = timeRanges[1]?.[1];
    const res = { isShow: false };

    if (timeSecondRangeStart && timeSecondRangeEnd) {
      if (
        !columnData?.timeRanges.some(
          ([startTime, endTime]) => startTime === timeSecondRangeStart && endTime === timeSecondRangeEnd,
        )
      ) {
        res.isShow = true;
      }
    }

    return res;
  }, [timeRanges, columnData?.timeRanges]);

  return useMemo(
    () => ({
      userSlots: columnData?.userSlots,
      cellIds,
      setSelectNewSell,
      isEditing,
      newSelectedSlots,
      isShowBefore,
      isShowAfter,
    }),
    [columnData, setSelectNewSell, isEditing, newSelectedSlots, cellIds, isShowBefore, isShowAfter],
  );
};
