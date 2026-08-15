import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router";
import { Stub } from "@/pages/Stub";
import { reportClientError } from "@/shared/api";

interface ICustomErrorBoudary {
  errorMessage: string;
  children: React.ReactNode;
}

export const CustomErrorBoudary = ({ errorMessage, children }: ICustomErrorBoudary) => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary
      resetKeys={[pathname]}
      fallbackRender={({ error }) => {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("[ErrorBoundary] pathname=", pathname, err.message, err.stack, error);
        return <Stub message={errorMessage} error={err} />;
      }}
      onError={(error: unknown, info: { componentStack?: string | null }) => {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("[ErrorBoundary] onError", err.message, err.stack, error);
        reportClientError({
          type: "react_error_boundary",
          message: err.message,
          stack: err.stack,
          componentStack: info?.componentStack ?? undefined,
          pathname,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
