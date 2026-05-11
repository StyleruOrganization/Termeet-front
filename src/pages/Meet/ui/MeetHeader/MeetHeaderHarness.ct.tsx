import { MemoryRouter, Route, Routes } from "react-router";
import { MeetHeader } from "./MeetHeader";

export function MeetHeaderHarnessCt({
  meetHash,
  query = "",
  props,
}: {
  meetHash: string;
  query?: string;
  props: React.ComponentProps<typeof MeetHeader>;
}) {
  const route = `/meet/${meetHash}${query ? `?${query}` : ""}`;

  return (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path='/meet/:hash' element={<MeetHeader {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}
