import { useCreateMeetStore } from "../../model/useCreateMeetStore";
import styles from "../../ui/Calendar/Calendar.module.css";

export const useCalendarData = () => {
  const selectedDates = useCreateMeetStore(state => state.values.dates);
  const setDate = useCreateMeetStore(state => state.setDate);
  const validateField = useCreateMeetStore(state => state.validateField);
  const error = useCreateMeetStore(state => state.errors.dates);

  const onDateClick = ({
    startDate,
    endDate,
    overrideCurrentData,
  }: {
    startDate: Date | null;
    endDate: Date | null;
    overrideCurrentData?: boolean;
  }) => {
    setDate(
      {
        start: startDate,
        end: endDate,
      },
      overrideCurrentData,
    );

    validateField("dates");
  };

  const formatClassName = (date: Date, forceHighlightDates?: (Date | null)[]) => {
    let className = "calendar-day ";
    className += styles.Calendar__Day;
    if (new Date().toDateString() === date.toDateString()) {
      className += " " + styles.Calendar__Day__Today;
    }
    if (date.getDay() == 6 || date.getDay() == 0) {
      className += " " + styles.Calendar__Day_Weekend;
    }
    if (
      selectedDates.some(({ start, end }) => {
        return start.toDateString() === date.toDateString() || end.toDateString() === date.toDateString();
      }) ||
      forceHighlightDates?.some(forceHighlightDate => forceHighlightDate?.toDateString() == date.toDateString())
    ) {
      className += " " + styles.Calendar__Day_Selected;
    }

    return className;
  };

  const formatClassNameForDateWrapperWhenHover = (
    selectedDateForInterval: Date | null,
    hoveredDate: Date | null,
    date: Date,
  ) => {
    if (!selectedDateForInterval || !hoveredDate || !date) return;

    const startDate = selectedDateForInterval > hoveredDate ? hoveredDate : selectedDateForInterval;
    const endDate = selectedDateForInterval < hoveredDate ? hoveredDate : selectedDateForInterval;
    const classNames = [];
    if (
      startDate.toDateString() === date.toDateString() &&
      selectedDateForInterval.toDateString() !== hoveredDate.toDateString()
    ) {
      classNames.push(styles.Calendar__Day_IntervalStartHover);
    } else if (
      endDate.toDateString() === date.toDateString() &&
      selectedDateForInterval.toDateString() !== hoveredDate.toDateString()
    ) {
      classNames.push(styles.Calendar__Day_IntervalEndHover);
    } else if (startDate < date && date < endDate) {
      classNames.push(styles.Calendar__Day_IntervalHover);
    }

    // Понедельник
    if (date.getDay() == 1) {
      classNames.push(styles.Top_Left_Radius);
      classNames.push(styles.Btm_Left_Radius);
    }
    // Воскресенье
    if (date.getDay() == 0) {
      classNames.push(styles.Top_Right_Radius);
      classNames.push(styles.Btm_Right_Radius);
    }

    return classNames.join(" ");
  };

  const formatClassNameInterval = (date: Date) => {
    const activeInterval = selectedDates.find(({ start, end }) => {
      return start <= date && date <= end;
    });

    const classNames = [];

    if (!activeInterval) return;
    if (
      activeInterval.start.toDateString() === date.toDateString() &&
      activeInterval.start.toDateString() !== activeInterval.end.toDateString()
    ) {
      classNames.push(styles.Calendar__Day_IntervalStart);
    } else if (
      activeInterval.end.toDateString() === date.toDateString() &&
      activeInterval.start.toDateString() !== activeInterval.end.toDateString()
    ) {
      classNames.push(styles.Calendar__Day_IntervalEnd);
    } else if (activeInterval.start < date && date < activeInterval.end) {
      classNames.push(styles.Calendar__Day_Interval);
    }

    // Понедельник
    if (date.getDay() == 1) {
      classNames.push(styles.Top_Left_Radius);
      classNames.push(styles.Btm_Left_Radius);
    }
    // Воскресенье
    if (date.getDay() == 0) {
      classNames.push(styles.Top_Right_Radius);
      classNames.push(styles.Btm_Right_Radius);
    }

    return classNames.join(" ");
  };

  return {
    onDateClick,
    selectedDates,
    formatClassName,
    formatClassNameInterval,
    formatClassNameForDateWrapperWhenHover,
    error,
  };
};
