import { lazy, Suspense } from "react";
import { Route, Routes as ReactRoutes } from "react-router";
import { Loader } from "@/shared/ui";
import { Layout } from "../layouts/Layout";
import { CustomErrorBoudary } from "../providers/ErrorBoudary";

const EntryPage = lazy(() => import("../../pages/Entry").then(module => ({ default: module.Entry })));
const CreateMeetPage = lazy(() => import("../../pages/CreateMeet").then(module => ({ default: module.CreateMeet })));
const MeetPage = lazy(() => import("../../pages/Meet").then(module => ({ default: module.Meet })));
const EditMeetPage = lazy(() => import("../../pages/EditMeet").then(module => ({ default: module.EditMeet })));
const StubPage = lazy(() => import("../../pages/Stub").then(module => ({ default: module.Stub })));

const withSuspense = (Component: React.LazyExoticComponent<() => React.JSX.Element>, message: string) => (
  <Suspense fallback={<Loader message={message} />}>
    <Component />
  </Suspense>
);

const withErrorBoundary = (component: React.ReactNode, errorMessage: string) => {
  return <CustomErrorBoudary errorMessage={errorMessage}>{component}</CustomErrorBoudary>;
};

export const Routing = () => {
  return (
    <ReactRoutes>
      <Route index element={withSuspense(EntryPage, "Загружаем страницу...")} />
      <Route path='/' element={<Layout />}>
        <Route path='create' element={withSuspense(CreateMeetPage, "Загружаем страницу...")} />
        <Route
          path='meet/:hash'
          element={withErrorBoundary(
            withSuspense(MeetPage, "Загружаем слоты..."),
            "Мы не нашли встречу, которую ты ищешь",
          )}
        />
        <Route
          path='meet/edit/:hash'
          element={withErrorBoundary(
            withSuspense(EditMeetPage, "Загружаем информацию о встрече..."),
            "Мы не нашли встречу, которую ты ищешь",
          )}
        />
        <Route path='*' element={<StubPage message='Мы не нашли страницу, которую ты ищешь' />} />
      </Route>
    </ReactRoutes>
  );
};
