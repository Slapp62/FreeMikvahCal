import { FC } from 'react';
import {
  Accordion,
  Anchor,
  Container,
  List,
  Paper,
  Text,
  Title,
  Blockquote,
  SimpleGrid,
  ThemeIcon,
  Stack,
  Box,
} from '@mantine/core';
import { IconCalendarStats, IconAlertTriangle, IconShieldLock, IconPray } from '@tabler/icons-react';
import { PageMeta } from '@/SEO/PageMeta';

const MikvahTerms: FC = () => {
  return (
    <>
      <PageMeta
        title="Terms of Service | MikvahCalendar"
        description="Terms and conditions for using our Taharat HaMishpacha tracking and calculator tools."
        keywords="mikvah calendar terms, taharat hamishpacha, halakhic calculator"
      />

      <Container size="lg" py="xl">
        <Title order={1} mb="xs">
          Terms of Service
        </Title>
        <Text c="dimmed" fs="italic" mb="xl">
          Last Updated: January 21, 2026 | Effective Date: Immediately
        </Text>

        {/* At a Glance Summary */}
        <Paper withBorder p="lg" radius="md" mb="xl" bg="pink.0">
          <Title order={2} size="h4" mb="md" c="pink.9">
            At a Glance
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Stack gap="xs">
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThemeIcon color="pink" size="sm" radius="xl"><IconPray size={14} /></ThemeIcon>
                <Text fw={700} size="sm">Halakhic Tool</Text>
              </Box>
              <Text size="sm">The calendar is a calculation aid. It does not replace the advice of a Rabbi or your personal Halakhic obligations.</Text>
            </Stack>
            <Stack gap="xs">
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThemeIcon color="grape" size="sm" radius="xl"><IconShieldLock size={14} /></ThemeIcon>
                <Text fw={700} size="sm">Privacy First</Text>
              </Box>
              <Text size="sm">Your data is encrypted. You are responsible for keeping your login credentials private.</Text>
            </Stack>
          </SimpleGrid>
        </Paper>

        <Text mb="md">
          Welcome to [Site Name]. Our platform is designed to assist English-speaking Jewish families 
          in the observance of Taharat HaMishpacha (Family Purity) through automated calculations and reminders.
        </Text>

        <Accordion variant="separated" radius="md">
          {/* 1. Service Description */}
          <Accordion.Item value="service-description">
            <Accordion.Control icon={<IconCalendarStats size={20} color="var(--mantine-color-pink-6)" />}>
              <Title order={3} size="h4">1. The Services Provided</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text mb="sm">We provide digital tools to track:</Text>
              <List mb="md" spacing="xs">
                <List.Item>Biological cycles and flow dates.</List.Item>
                <List.Item>Calculations for Vestos (projections) including Day 30, Haflagah, and Onah Beinonit.</List.Item>
                <List.Item>Calculations for Hefsek Taharah and Seven Clean Days (Shiva Nekiyim).</List.Item>
                <List.Item>SMS or Email reminders for upcoming Onahs or Mikvah nights.</List.Item>
              </List>

              <Blockquote color="pink" icon={<IconAlertTriangle size={24} />} mt="xl">
                <Text fw={700}>Religious & Legal Disclaimer:</Text>
                Calculations are based on the data <strong>you</strong> enter. Incorrect dates will lead 
                to incorrect Halakhic projections. This software is an <strong>aid</strong>, not a Rabbi. 
                In cases of doubt or complex biological scenarios, you must consult a qualified Posek.
              </Blockquote>
            </Accordion.Panel>
          </Accordion.Item>

          {/* 2. User Responsibilities */}
          <Accordion.Item value="user-obligations">
            <Accordion.Control icon={<IconShieldLock size={20} color="var(--mantine-color-grape-6)" />}>
              <Title order={3} size="h4">2. Account Security & Accuracy</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text mb="sm">Due to the intimate nature of the data:</Text>
              <List mb="md" spacing="xs">
                <List.Item><strong>Confidentiality:</strong> You are responsible for maintaining a secure password and ensuring third parties do not access your account.</List.Item>
                <List.Item><strong>Data Entry:</strong> You acknowledge that the accuracy of all reminders and projections depends entirely on the accuracy of the dates you input.</List.Item>
                <List.Item><strong>Minimum Age:</strong> You must be at least 18 years old or married to use this service.</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          {/* 3. Subscription & Payments (Optional - Refactor if free) */}
          <Accordion.Item value="billing">
            <Accordion.Control icon={<IconCalendarStats size={20} color="var(--mantine-color-teal-6)" />}>
              <Title order={3} size="h4">3. Subscription & Access</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text mb="sm">Access to premium features (e.g., SMS reminders, Rabbinical consultation tools) may require a paid subscription.</Text>
              <List spacing="xs">
                <List.Item>Subscriptions are billed in advance and are non-refundable except where required by law.</List.Item>
                <List.Item>You may cancel your subscription at any time, but access will remain until the end of the current billing cycle.</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          {/* 4. Limitation of Liability */}
          <Accordion.Item value="liability">
            <Accordion.Control icon={<IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />}>
              <Title order={3} size="h4">4. Limitation of Liability</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text mb="md">
                To the fullest extent permitted by law, [Site Name] and its operators shall not be liable for:
              </Text>
              <List spacing="xs" mb="md">
                <List.Item>Halakhic errors resulting from software bugs or user input errors.</List.Item>
                <List.Item>Missed reminders due to technical failures, carrier issues, or email filters.</List.Item>
                <List.Item>Personal or marital distress arising from the use or misuse of the platform.</List.Item>
              </List>
              <Text size="sm" c="dimmed">
                Our total liability is limited to the amount paid for the service in the 12 months 
                preceding the claim.
              </Text>
            </Accordion.Panel>
          </Accordion.Item>

          {/* 5. Account Deletion & Data */}
          <Accordion.Item value="termination">
            <Accordion.Control icon={<IconShieldLock size={20} color="var(--mantine-color-gray-6)" />}>
              <Title order={3} size="h4">5. Account Deletion</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Text mb="sm">You may delete your account at any time.</Text>
              <List withPadding spacing="xs">
                <List.Item>Upon deletion, all cycle history and sensitive personal dates are removed from our active databases.</List.Item>
                <List.Item><strong>Warning:</strong> This data is not recoverable once the 30-day grace period has passed.</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>

          {/* 6. Contact */}
          <Accordion.Item value="contact">
            <Accordion.Control>
              <Title order={3} size="h4">6. Support & Contact</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <Paper p="md" withBorder>
                <Text mb="xs">For technical support or billing inquiries:</Text>
                <Text>Email: <Anchor href="mailto:support@mikvahcalendar.com">support@yoursite.com</Anchor></Text>
                <Text>Location: Beit Shemesh, Israel</Text>
              </Paper>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* Footer */}
        <Text
          ta="center"
          c="dimmed"
          pt="xl"
          mt="xl"
          size="sm"
          style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
        >
          © {new Date().getFullYear()} [Site Name]. All rights reserved.
          <br />
          Dedicated to the sanctity and growth of Jewish families.
        </Text>
      </Container>
    </>
  );
};

export default MikvahTerms;