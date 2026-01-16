import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './Layout';
import RouteGuard from './RouteGuard';
import HomePage from '../pages/home.page';
import AboutPage from '../pages/about.page';
import { LoginPage } from '../pages/login.page';
import RegisterPage from '../pages/register.page';
import PageNotFound from '../pages/404.page';
import CalendarPage from '../pages/calendar.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },

      // Auth routes (redirect to home if already logged in)
      {
        path: 'register',
        element: (
          <RouteGuard requireNoAuth>
            <RegisterPage />
          </RouteGuard>
        ),
      },
      {
        path: 'login',
        element: (
          <RouteGuard requireNoAuth>
            <LoginPage />
          </RouteGuard>
        ),
      },

      // Protected routes
      {
        path: 'calendar',
        element: (
          <RouteGuard requireAuth>
            <CalendarPage />
          </RouteGuard>
        ),
      },

      { path: '*', element: <PageNotFound /> },
    ],
  },
],
  {
    basename: '/',
  });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
