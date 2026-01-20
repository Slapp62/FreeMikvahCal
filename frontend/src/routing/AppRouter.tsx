import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import RouteGuard from './RouteGuard';
import { LoadingOverlay } from '@mantine/core';

// Eagerly load home page (first thing users see)
import HomePage from '../pages/home.page';

// Lazy load all other pages
const AboutPage = lazy(() => import('../pages/about.page'));
const LoginPage = lazy(() => import('../pages/login.page').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/register.page'));
const PageNotFound = lazy(() => import('../pages/404.page'));
const CalendarPage = lazy(() => import('../pages/calendar.page'));
const EditUserSettings = lazy(() => import('../pages/editUserSettings.page'));

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="about"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <AboutPage />
            </Suspense>
          }
        />

        {/* Auth routes - accessible only to non-authenticated users */}
        <Route
          path="register"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <RouteGuard permission="non-user">
                <RegisterPage />
              </RouteGuard>
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <RouteGuard permission="non-user">
                <LoginPage />
              </RouteGuard>
            </Suspense>
          }
        />

        {/* Protected routes - accessible only to authenticated users */}
        <Route
          path="calendar"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <RouteGuard permission="user">
                <CalendarPage />
              </RouteGuard>
            </Suspense>
          }
        />

        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <RouteGuard permission="user">
                <EditUserSettings />
              </RouteGuard>
            </Suspense>
          }
        />

        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingOverlay visible />}>
              <PageNotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
