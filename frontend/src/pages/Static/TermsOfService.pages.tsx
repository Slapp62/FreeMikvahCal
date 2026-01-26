import { FC } from 'react';
import {
  Container,
  Text,
  Title,
  Paper,
  Divider,
  List,
  Anchor,
  Box,
  Stack,
} from '@mantine/core';
import { PageMeta } from '../../components/PageMeta';

const MikvahTerms: FC = () => {
  return (
    <>
      <PageMeta
        title="Terms of Service | FreeMikvahCal"
        description="Standard legal terms and conditions for using FreeMikvahCal."
      />

      <Container size="md" py="xl">
        <Title order={1} mb="xs">Terms of Service</Title>
        <Text c="dimmed" size="sm" mb="xl">
          Last Updated: January 21, 2026
        </Text>

        <Paper withBorder p="md" mb="xl" bg="gray.0" radius="md">
          <Text size="sm" fw={500} mb="xs">PLEASE READ THIS CAREFULLY:</Text>
          <Text size="sm">
            This User Agreement governs your access to and use of FreeMikvahCal. By accessing or using 
            the website, you agree to be bound by these terms. If you do not agree to all terms and 
            conditions, do not use this service.
          </Text>
        </Paper>

        {/* Table of Contents for quick navigation */}
        <Box mb="xl">
          <Title order={4} mb="sm" size="h6" c="dimmed" style={{ textTransform: 'uppercase' }}>
            Agreement Sections
          </Title>
          <List size="sm" spacing="xs" variant="ordered">
            <List.Item><Anchor href="#acceptance">Acceptance of Terms</Anchor></List.Item>
            <List.Item><Anchor href="#disclaimer">Disclaimer of Warranty & Accuracy</Anchor></List.Item>
            <List.Item><Anchor href="#restrictions">Usage Restrictions & IP</Anchor></List.Item>
            <List.Item><Anchor href="#liability">Limitation of Liability</Anchor></List.Item>
            <List.Item><Anchor href="#governing-law">Governing Law & Severability</Anchor></List.Item>
            <List.Item><Anchor href="#termination">Account Termination</Anchor></List.Item>
          </List>
        </Box>

        <Divider mb="xl" />

        <Stack gap="xl">
          {/* Section 1 */}
          <section id="acceptance">
            <Title order={3} size="h4" mb="md">1. Acceptance of Terms</Title>
            <Text mb="sm">
              FreeMikvahCal (the "Service") is provided subject to your compliance with the terms 
              and conditions set forth below. We reserve the right to modify or amend these terms 
              at any time. Your continued use of the Service constitutes an express acceptance 
              of the most recent version of this Agreement.
            </Text>
          </section>

          {/* Section 2 */}
          <section id="disclaimer">
            <Title order={3} size="h4" mb="md">2. Disclaimer of Warranty & Accuracy</Title>
            <Text mb="sm" fw={700}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE."</Text>
            <Text mb="md">
              FreeMikvahCal makes no warranty of accuracy, completeness, reliability, or 
              fitness for a particular purpose. We do not warrant that the Service will be 
              uninterrupted, timely, secure, or free from error. 
            </Text>
            <Text mb="md" style={{ fontStyle: 'italic' }}>
              Religious Note: Calculations are based solely on user-provided data. This software 
              is a calculation aid and does not constitute Halakhic or medical advice. Users 
              must consult a qualified Posek (Rabbi) for specific rulings.
            </Text>
          </section>

          {/* Section 3 */}
          <section id="restrictions">
            <Title order={3} size="h4" mb="md">3. Usage Restrictions & Intellectual Property</Title>
            <Text mb="sm">
              All content, including text, logic, graphics, and code, is the property of 
              FreeMikvahCal and is protected by U.S. and international copyright laws.
            </Text>
            <Text fw={700} size="sm" mb="xs">You specifically agree not to:</Text>
            <List spacing="xs" mb="md" withPadding>
              <List.Item>Access the Service through automated means (scripts, bots, or crawlers).</List.Item>
              <List.Item>Reverse engineer, decompile, or attempt to extract the source code.</List.Item>
              <List.Item>Use the Service for any unlawful, harassing, or fraudulent purpose.</List.Item>
              <List.Item>Reproduce or copy the Service logic for commercial use.</List.Item>
            </List>
          </section>

          {/* Section 4 */}
          <section id="liability">
            <Title order={3} size="h4" mb="md">4. Limitation of Liability</Title>
            <Text mb="md">
              To the fullest extent permitted by law, FreeMikvahCal and its operators shall not 
              be liable for any direct, indirect, or consequential damages resulting from:
            </Text>
            <List spacing="xs" withPadding>
              <List.Item>Errors in Halakhic calculations or missed notification reminders.</List.Item>
              <List.Item>Unauthorized access to your account or data breaches.</List.Item>
              <List.Item>The security or data collection procedures of your browser or OS.</List.Item>
              <List.Item>Personal or marital distress arising from use of the Service.</List.Item>
            </List>
          </section>

          {/* Section 5 */}
          <section id="governing-law">
            <Title order={3} size="h4" mb="md">5. Governing Law & Severability</Title>
            <Text mb="md">
              <strong>Governing Law:</strong> This Agreement shall be governed by the laws of 
              the State of [Your State], without regard to conflict of law principles. 
              Any legal action must be brought in the courts located in [Your County/City].
            </Text>
            <Text>
              <strong>Severability:</strong> If any provision of this Agreement is held to be 
              unenforceable, that section shall be limited to the minimum extent necessary, 
              and the remainder of the Agreement shall remain in full force and effect.
            </Text>
          </section>

          {/* Section 6 */}
          <section id="termination">
            <Title order={3} size="h4" mb="md">6. Termination</Title>
            <Text>
              We reserve the right to terminate your access to the Service at any time, 
              without notice, for any conduct that we, in our sole discretion, believe 
              violates this Agreement or is harmful to other users or the Service.
            </Text>
          </section>
        </Stack>

        <Divider my="xl" />

        <Text ta="center" size="sm" c="dimmed">
          Contact: <Anchor href="mailto:support@freemikvahcal.com">support@freemikvahcal.com</Anchor>
          <br />
          © {new Date().getFullYear()} FreeMikvahCal. All rights reserved.
        </Text>
      </Container>
    </>
  );
};

export default MikvahTerms;