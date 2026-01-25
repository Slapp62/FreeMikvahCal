import {
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Flex,
  Text,
  Group,
  ScrollArea,
  ActionIcon,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LightDarkToggle } from './LightDarkToggle';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '../../hooks/useAuth';
import { IconSettings, IconCalendar } from '../../utils/icons';
import {Image} from '@mantine/core';

export function Header() {
  const user = useUserStore((state) => state.user);
  const { logout: logoutHandler } = useAuth();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      {/* Main Header */}
      <Box
        component="header"
        style={{
          borderBottom: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
          backgroundColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--mantine-shadow-xs)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center" h={70}>
            {/* Logo / Brand */}
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Group gap="xs" align="center" justify="center" h={40} p={0}>
                <Box h={40} w={40}>
                  <Image src="/flower-icon-512-noBg.png" />
                </Box>
                <Text
                  size="xl"
                  fw={800}
                  h={40}
                  lh={2}
                  style={{
                    background: 'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                  visibleFrom="sm"
                >
                  FreeMikvahCal
                </Text>
              </Group>
            </Link>

            {/* Desktop Navigation */}
            <Group gap="xl" visibleFrom="md">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Text fw={600} c="dimmed" style={{ transition: 'color 150ms' }} className="nav-link">
                  Home
                </Text>
              </Link>
              <Link to="/about" style={{ textDecoration: 'none' }}>
                <Text fw={600} c="dimmed" style={{ transition: 'color 150ms' }} className="nav-link">
                  About
                </Text>
              </Link>
              {user && (
                <Link to="/calendar" style={{ textDecoration: 'none' }}>
                  <Text fw={600} c="dimmed" style={{ transition: 'color 150ms' }} className="nav-link">
                    Calendar
                  </Text>
                </Link>
              )}
            </Group>

            {/* Desktop Actions */}
            <Group gap="md" visibleFrom="md">
              {!user ? (
                <>
                  <Button component={Link} to="/login" variant="subtle" color="secondary">
                    Login
                  </Button>
                  <Button component={Link} to="/register" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <ActionIcon component={Link} to="/settings" variant="subtle" color="secondary" size="lg">
                    <IconSettings size={20} />
                  </ActionIcon>
                  <Button variant="subtle" color="secondary" onClick={logoutHandler}>
                    Logout
                  </Button>
                </>
              )}
              <LightDarkToggle />
            </Group>

            {/* Mobile Menu Button */}
            <Group hiddenFrom="md">
              <LightDarkToggle />
              <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" />
            </Group>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="75%"
        padding="lg"
        title={
          <Group gap="xs">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--mantine-radius-md)',
                background: 'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCalendar size={18} color="white" stroke={2.5} />
            </Box>
            <Text fw={700}>FreeMikvahCal</Text>
          </Group>
        }
        hiddenFrom="md"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)">
          <Stack gap="md">
            <Divider />

            {/* Navigation Links */}
            <Stack gap="xs">
              <Link to="/" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
                <Text fw={600} c="secondary" size="lg">
                  Home
                </Text>
              </Link>
              <Link to="/about" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
                <Text fw={600} c="secondary" size="lg">
                  About
                </Text>
              </Link>
              {user && (
                <Link to="/calendar" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
                  <Text fw={600} c="secondary" size="lg">
                    Calendar
                  </Text>
                </Link>
              )}
            </Stack>

            <Divider my="md" />

            {/* Action Buttons */}
            <Stack gap="sm">
              {!user ? (
                <>
                  <Button component={Link} to="/login" onClick={closeDrawer} variant="outline" fullWidth>
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    onClick={closeDrawer}
                    variant="gradient"
                    gradient={{ from: 'pink', to: 'purple' }}
                    fullWidth
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/settings"
                    onClick={closeDrawer}
                    variant="light"
                    color="secondary"
                    fullWidth
                    leftSection={<IconSettings size={18} />}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      logoutHandler();
                      closeDrawer();
                    }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </ScrollArea>
      </Drawer>

      <style>{`
        .nav-link:hover {
          color: var(--mantine-color-purple-6) !important;
        }
      `}</style>
    </>
  );
}