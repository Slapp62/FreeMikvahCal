import {
  IconBrandGithub,
  IconCalendar,
} from '../../utils/icons';
import { Container, Grid, Group, Text, Stack, Box, Anchor, Divider } from '@mantine/core';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <Box
      component="footer"
      style={{
        backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
        borderTop: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))',
        marginTop: 'auto',
      }}
    >
      {/* Main Footer Content */}
      <Container size="xl" py={60}>
        <Grid gutter={{ base: 'md', md: 'xl' }}>
          {/* Brand Section */}
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Stack gap="md">
              <Group gap="xs">
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--mantine-radius-md)',
                    background:
                      'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconCalendar size={20} color="white" stroke={2.5} />
                </Box>
                <Text
                  size="lg"
                  fw={800}
                  style={{
                    background:
                      'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  FreeMikvahCal
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Simplifying halachic cycle tracking for Jewish women everywhere. 100% free, forever.
              </Text>
            </Stack>
          </Grid.Col>

          {/* Quick Links */}
          <Grid.Col span={{ base: 6, sm: 3, lg: 2 }}>
            <Stack gap="sm">
              <Text fw={700} size="sm" tt="uppercase" c="secondary">
                Quick Links
              </Text>
              <Anchor component={Link} to="/" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Home
              </Anchor>
              <Anchor component={Link} to="/about" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                About
              </Anchor>
              <Anchor component={Link} to="/information" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Glossary
              </Anchor>
              <Anchor component={Link} to="/about#contact" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Contact Us
              </Anchor>
              <Anchor component={Link} to="/login" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Login
              </Anchor>
              <Anchor component={Link} to="/register" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Sign Up
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Legal */}
          <Grid.Col span={{ base: 6, sm: 3, lg: 2 }}>
            <Stack gap="sm">
              <Text fw={700} size="sm" tt="uppercase" c="secondary">
                Legal
              </Text>
              <Anchor component={Link} to="/privacy-policy" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Privacy Policy
              </Anchor>
              <Anchor component={Link} to="/terms-of-service" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Terms of Service
              </Anchor>
              <Anchor component={Link} to="/accessibility" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
                Accessibility
              </Anchor>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      <Divider color="light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))" />

      {/* Footer Bottom */}
      <Container size="xl" py="md">
        <Group justify="space-between" wrap="wrap">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} FreeMikvahCal. All rights reserved.
            </Text>
          </Group>

          <Group gap="md">
            <Anchor
              href="https://github.com/Slapp62/freeMikvahCal.git"
              target="_blank"
              c="dimmed"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <IconBrandGithub size={20} />
            </Anchor>
            <Anchor
              href="https://simchalapp.com"
              target="_blank"
              c="dimmed"
              size="sm"
              style={{ textDecoration: 'underline' }}
            >
              Portfolio
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}