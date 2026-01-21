import { Flex } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Navigation/Header';
import { Footer } from '../components/Navigation/Footer';
import classes from './layout.module.css';

export function Layout() {
  // Session restoration is handled in App.tsx with useSessionRestore hook

  return (
    <>
      <Flex direction="column" mih="100vh" className={classes.wrapper}>
        <Header />

        <main className={classes.main}>
          <Outlet />
        </main>

        <Footer />
      </Flex>
    </>
  );
}
