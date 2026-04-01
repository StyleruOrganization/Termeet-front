import { useNavigate } from "react-router";
import styles from "./Stub.module.css";

export const Stub = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.NoMeetPage}>
      <h1>Мы не нашли страницу, которую ты ищешь</h1>
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
