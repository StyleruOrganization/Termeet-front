import { Route, Routes as ReactRoutes } from "react-router";
import { CreateMeetPage } from "@pages/CreateMeetPage";
import { MeetPage } from "@pages/MeetPage";
import { Layout } from "../layouts/Layout";

export const Routes = () => {
  return (
    <ReactRoutes>
      <Route path='/' element={<Layout />}>
        <Route index element={<CreateMeetPage />} />
        <Route path='meet' element={<MeetPage />} />
      </Route>
    </ReactRoutes>
  );
};
