import { CalendarWidget } from "../index";

// Обертка для компонента с react-hook-form
export const CalendarWithForm = () => {
  return (
    <div style={{ padding: "10px", maxWidth: "650px" }}>
      <CalendarWidget minDate={new Date(2026, 0)} value={new Date(2026, 0, 1)} />
    </div>
  );
};
