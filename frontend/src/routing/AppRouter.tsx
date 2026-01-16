import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import RouteGuard from './RouteGuard';
import HomePage from '../pages/home.page';
import AboutPage from '../pages/about.page';
import { LoginPage } from '../pages/login.page';
import RegisterPage from '../pages/register.page';
import PageNotFound from '../pages/404.page';
import CalendarPage from '../pages/calendar.page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />

        {/* Auth routes - accessible only to non-authenticated users */}
        <Route
          path="register"
          element={
            <RouteGuard permission="non-user">
              <RegisterPage />
            </RouteGuard>
          }
        />
        <Route
          path="login"
          element={
            <RouteGuard permission="non-user">
              <LoginPage />
            </RouteGuard>
          }
        />

        {/* Protected routes - accessible only to authenticated users */}
        <Route
          path="calendar"
          element={
            <RouteGuard permission="user">
              <CalendarPage />
            </RouteGuard>
          }
        />

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}
