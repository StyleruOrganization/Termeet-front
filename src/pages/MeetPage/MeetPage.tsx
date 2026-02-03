import { useState } from "react";
import { MeetTable } from "@/components/MeetTable";
import styles from "./MeetPage.module.css";
import type { MeetPageProps } from "./MeetPage.types";

const moocks = {
  start_time: "09:30:00",
  end_time: "17:00:00",
  meeting_days: ["2026-02-03", "2026-02-04"],
};

export const MeetPage = (props: MeetPageProps) => {
  console.log("RENDERING MeetPage");

  return <MeetTable meeting_days={moocks.meeting_days} start_time={moocks.start_time} end_time={moocks.end_time} />;
};
