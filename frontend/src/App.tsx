import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { useEffect } from "react";
import { AppRouter } from "./routing/AppRouter";
import myTheme from "./styles/theme";
import { useSessionRestore } from "./hooks/useSessionRestore";

export default function App() {
  // Restore session on app mount
  useSessionRestore();

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
      <AppRouter />
    </MantineProvider>
  );
}
