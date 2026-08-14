import { useNavigate } from "react-router";
import styles from "./Stub.module.css";

export const Stub = ({ message, error }: { message: string; error?: Error }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.NoMeetPage}>
      <h1>{message}</h1>
      {error ? (
        <pre className={styles.NoMeetPage__Error}>
          {error.name}: {error.message}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
      ) : null}
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
