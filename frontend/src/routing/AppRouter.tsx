import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './Layout';
import HomePage from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import RegisterPage from '../pages/register.page';
import PageNotFound from '../pages/404.page';
import CalendarPage from '../pages/calendar.page';

const router = createBrowserRouter([
  {
    
    path: '/',
    element: <Layout />,
    children: [
      {index: true, element: <HomePage />},
      
      {path: 'register', element: <RegisterPage/>},
      {path: 'login', element: <LoginPage/>},
      {path: '/calendar', element: <CalendarPage/>},

      {path: '*', element: <PageNotFound/>},
    ]
  },
  
],
  {
    basename: '/',
  });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
