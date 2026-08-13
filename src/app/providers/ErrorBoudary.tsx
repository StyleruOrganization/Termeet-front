import { ErrorBoundary } from "react-error-boundary";
import { Stub } from "@/pages/Stub";
import { reportClientError } from "@/shared/api";

interface ICustomErrorBoudary {
  errorMessage: string;
  children: React.ReactNode;
}

export const CustomErrorBoudary = ({ errorMessage, children }: ICustomErrorBoudary) => {
  return (
    <ErrorBoundary
      fallback={<Stub message={errorMessage} />}
      onError={(error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error));
        reportClientError({ message: err.message, stack: err.stack });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
