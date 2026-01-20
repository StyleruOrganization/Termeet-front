import { useEffect } from "react";
import { isTouchDevice } from "@shared/utils/isTouchDevice";
import { CreateMeetingPage } from "./pages/CreateMeetingPage";

import "@styles/reset.css";
import "@styles/global.css";
import "@styles/fonts.css";
import "@styles/variables.css";

function App() {
  useEffect(() => {
    if (isTouchDevice()) {
      document.documentElement.classList.add("touchDevice");
    } else {
      document.documentElement.classList.remove("touchDevice");
    }
  }, []);
  return (
    <>
      <CreateMeetingPage />
    </>
  );
}

export default App;
