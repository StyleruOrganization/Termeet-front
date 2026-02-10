// @ts-nocheck
import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration } from "react-router";
import fonts from "@styles/fonts.css?url";
import global from "@styles/global.css?url";
import reset from "@styles/reset.css?url";
import variables from "@styles/variables.css?url";
import { App as AppContainer } from "./App";
import type { Route } from "./+types/root";

/* eslint-disable react-refresh/only-export-components */
export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: reset,
  },
  {
    rel: "stylesheet",
    href: global,
  },
  {
    rel: "stylesheet",
    href: fonts,
  },
  {
    rel: "stylesheet",
    href: variables,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Termeet-front</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <AppContainer />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
