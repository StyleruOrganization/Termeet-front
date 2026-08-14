import { useSessionStore } from "@/entities/User";
import { Entry } from "@/pages/Entry";
import { Home } from "@/pages/Home";
import { Loader } from "@/shared/ui";

export const RootPage = () => {
  const status = useSessionStore(state => state.status);
  const user = useSessionStore(state => state.user);

  if (status === "idle" || status === "loading") {
    return <Loader message='Загружаем...' />;
  }

  if (user) {
    return <Home />;
  }

  return <Entry />;
};
