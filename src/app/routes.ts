import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "../pages/CreateMeetingPage/CreateMeetingPage.tsx"),
  route("/meet", "../pages/MeetPage/MeetPage.tsx"),
] satisfies RouteConfig;
