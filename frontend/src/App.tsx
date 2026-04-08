import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  MantineProvider,
  LoadingOverlay,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from "./routing/AppRouter.tsx";
import { ScrollToTop } from "./routing/ScrollToTop";
import myTheme from "./styles/theme";
import ErrorBoundary from "./components/ErrorCatching/ErrorBoundary";
import { KofiDonationPopup } from "./components/KofiDonationPopup";
import { useSessionRestore } from "./hooks/useSessionRestore";

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'freemikvahcal-color-scheme',
});

export default function App() {
  // Restore session on app load (critical for OAuth flow)
  const { isRestoring } = useSessionRestore();
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

  // Show loading overlay while restoring session
  if (isRestoring) {
    return (
      <MantineProvider
        theme={myTheme}
        defaultColorScheme="light"
        colorSchemeManager={colorSchemeManager}
      >
        <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
      </MantineProvider>
    );
  }

  return (
    <HelmetProvider>
      <MantineProvider
        theme={myTheme}
        defaultColorScheme="light"
        colorSchemeManager={colorSchemeManager}
      >
        <Notifications />
        <ErrorBoundary useMantineFallback={true}>
          <BrowserRouter>
            <ScrollToTop />
            <AppRouter />
          </BrowserRouter>
        </ErrorBoundary>
        <KofiDonationPopup />
      </MantineProvider>
    </HelmetProvider>
  );
}
