import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "@/components/Header";
import { CreateMeetingPage } from "@/pages/CreateMeetingPage/CreateMeetingPage";
import { MeetPage } from "@/pages/MeetPage/MeetPage";
import styles from "./App.module.css";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<CreateMeetingPage />} />
          <Route path='meet' element={<MeetPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const Layout = () => (
  <>
    <Header />
    <div className={styles.MainContainer}>
      <Outlet />
    </div>
  </>
);
