import { useNavigate } from "react-router";
import styles from "./Stub.module.css";

export const Stub = ({ message }: { message: string }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.NoMeetPage}>
      <h1>{message}</h1>
      <button
        onClick={() => {
          navigate("/create");
        }}
        className='baseButton mainButton'
      >
        Вернуться к созданию встречи
      </button>
    </div>
  );
};
