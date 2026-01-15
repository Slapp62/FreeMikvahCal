import { IconMailFilled, IconMapPinFilled, IconPhoneFilled } from '@tabler/icons-react';
import { Container, Flex, Group, Text, Title } from '@mantine/core';

import classes from './FooterStyles.module.css'
//import { Logo } from './Logo';

const data = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home Page', link: '/' },
      { label: 'Login', link: '/login' },
      { label: 'Register', link: '/register' },
      { label: 'About', link: '/about' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', link: 'https://github.com/Slapp62/freeMikvahCal.git'},
      { label: 'MantineUI', link: 'https://mantine.dev' },
      { label: 'React', link: 'https://react.dev' },
      { label: 'Vite', link: 'https://vitejs.dev' },
      { label: 'Redux', link: 'https://redux.js.org'},
    ],
  },
  {
    title: 'About Me',
    links: [
      { label: 'LinkedIn', link: 'https://www.linkedin.com/in/simcha-lapp-0b4081106/' },
      { label: 'Portfolio Website', link: 'https://slapp62.github.io/portfolio_site/' },
    ],
  },
];

export function Footer() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<'a'>
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        target='_blank'
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          {/* <Logo /> */}
          <Text size="xs" c="dimmed" className={classes.description}>
            Creating opportunities and careers with simplicity in mind.
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>

        <Flex direction="column" c="dimmed" gap={5}>
            <Title className={classes.title}>Contact Me</Title>
            <Group><IconMailFilled /> <Text>slapp62@gmail.com</Text></Group>
            <Group><IconPhoneFilled /> <Text>+972-58-434-5797</Text></Group>
            <Group><IconMapPinFilled /> <Text>Beit Shemesh, IL</Text></Group>
        </Flex>
        
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()} - Developed by Simcha Lapp. 
        </Text>

        <Text c="dimmed" size="sm">All rights reserved</Text>
      </Container>
    </footer>
  );
}