import { ErrorBoundary } from "react-error-boundary";
import { Stub } from "@/pages/Stub";

interface ICustomErrorBoudary {
  errorMessage: string;
  children: React.ReactNode;
}

export const CustomErrorBoudary = ({ errorMessage, children }: ICustomErrorBoudary) => {
  return <ErrorBoundary fallback={<Stub message={errorMessage} />}>{children}</ErrorBoundary>;
};
