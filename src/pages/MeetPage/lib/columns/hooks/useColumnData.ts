import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useMeetContext } from "@entities/Meet";

export const useColumnData = (dateId: string) => {
  const columnData = useMeetContext(useShallow(store => store.oldSelectedSlots.get(dateId))),
    setSelectNewSell = useMeetContext(store => store.setSelectNewSell),
    isEditing = useMeetContext(store => store.isEditing),
    maxSelectCount = useMeetContext(store => store.maxSelectCount),
    newSelectedSlots = useMeetContext(useShallow(store => store.newSelectedSlots.get(dateId))),
    hoveredUser = useMeetContext(store => store.hoveredUser);

  return useMemo(
    () => ({
      columnData,
      setSelectNewSell,
      isEditing,
      maxSelectCount,
      newSelectedSlots,
      hoveredUser,
    }),
    [columnData, setSelectNewSell, isEditing, maxSelectCount, newSelectedSlots, hoveredUser],
  );
};
