import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { MeetProvider, useMeetStore } from "@entities/Meet";
import { MeetModal } from "./MeetModal";

function MeetModalStateInit({ users }: { users: string[] }) {
  const setIsModalOpen = useMeetStore(s => s.setIsModalOpen);
  const setUsers = useMeetStore(s => s.setUsers);

  useEffect(() => {
    setUsers(users);
    setIsModalOpen(true);
  }, [setIsModalOpen, setUsers, users]);

  return null;
}

export function MeetModalHarnessCt({ meetHash, users }: { meetHash: string; users: string[] }) {
  const queryClient = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/meet/${meetHash}`]}>
        <Routes>
          <Route
            path='/meet/:hash'
            element={
              <MeetProvider timeInfo={new Map()} timeRanges={[]} users={users}>
                <MeetModalStateInit users={users} />
                <MeetModal />
              </MeetProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
