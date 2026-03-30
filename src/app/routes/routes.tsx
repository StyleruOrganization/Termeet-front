import { Route, Routes as ReactRoutes } from "react-router";
import { EditMeetPage } from "@/pages/EditMeetPage";
import { MeetPage } from "@/pages/MeetPage";
import { StubPage } from "@/pages/StubPage";
import { CreateMeetPage } from "@pages/CreateMeetPage";
import { EntryPage } from "@pages/EntryPage";
import { Layout } from "../layouts/Layout";

export const Routes = () => {
  return (
    <ReactRoutes>
      <Route index element={<EntryPage />} />
      <Route path='/' element={<Layout />}>
        <Route path='/create' element={<CreateMeetPage />} />
        <Route path='/meet/:hash' element={<MeetPage />} />
        <Route path='/meet/edit/:hash' element={<EditMeetPage />} />
        <Route path='*' element={<StubPage />} />
      </Route>
    </ReactRoutes>
  );
};
