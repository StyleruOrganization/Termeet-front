import { MeetingForm } from "./../MeetingForm";

// Обертка для компонента с react-hook-form
export const MeetingFormWithForm = () => {
  return (
    <div style={{ padding: "10px" }}>
      <MeetingForm />
    </div>
  );
};
