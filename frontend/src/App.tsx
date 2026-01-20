import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routing/AppRouter.tsx";
import myTheme from "./styles/theme";

export default function App() {
  // Global error handlers
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Log to analytics service in production
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Log to analytics service in production
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <MantineProvider theme={myTheme}>
      <Notifications />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </MantineProvider>
  );
}
