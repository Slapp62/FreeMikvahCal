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
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { PageMeta } from '../../components/PageMeta';

const PrivacyPolicy: FC = () => {
  return (
    <>
      <PageMeta
        title="Privacy Policy | FreeMikvahCal"
        description="Detailed privacy policy and security practices for FreeMikvahCal."
      />

      <Container size="md" py="xl">
        <Title order={1} mb="xs">Privacy Policy & Security Statement</Title>
        <Text c="dimmed" size="sm" mb="xl">
          Last Updated: May 20, 2024 | Effective Date: May 20, 2024
        </Text>

        <Alert icon={<IconAlertCircle size="1rem" />} title="Privacy Commitment" color="blue" mb="xl">
          We maintain a "privacy-first" approach. We do not sell your data, and we do not use 
          third-party marketing trackers. All sensitive data is treated with the highest 
          level of religious and personal confidentiality.
        </Alert>

        <Box mb="xl">
          <Title order={4} mb="sm" size="h6" c="dimmed" style={{ textTransform: 'uppercase' }}>
            Policy Sections
          </Title>
          <List size="sm" spacing="xs" variant="ordered">
            <List.Item><Anchor href="#controller">Data Controller & Contact</Anchor></List.Item>
            <List.Item><Anchor href="#collection">Information We Collect</Anchor></List.Item>
            <List.Item><Anchor href="#security">Security & Risk Assumption</Anchor></List.Item>
            <List.Item><Anchor href="#user-duty">User Responsibility & Device Security</Anchor></List.Item>
            <List.Item><Anchor href="#third-parties">Third-Party Disclosures</Anchor></List.Item>
            <List.Item><Anchor href="#retention">Data Rights & Retention</Anchor></List.Item>
            <List.Item><Anchor href="#policy-changes">Changes to this Policy</Anchor></List.Item>
          </List>
        </Box>

        <Divider mb="xl" />

        <Stack gap="xl">
          {/* Section 1 */}
          <section id="controller">
            <Title order={3} size="h4" mb="md">1. Data Controller & Contact Information</Title>
            <Text mb="sm">
              The data controller for FreeMikvahCal is the <strong>FreeMikvahCal Team</strong>. 
              If you have any questions about how we handle your personal data, or if you want 
              to exercise your privacy rights, contact us at:
            </Text>
            <Text fw={700}>
              Email: <Anchor href="mailto:support@freemikvahcal.com">support@freemikvahcal.com</Anchor>
            </Text>
          </section>

          {/* Section 2 */}
          <section id="collection">
            <Title order={3} size="h4" mb="md">2. What Information We Collect</Title>
            <Text fw={700} size="sm" mb="xs">A. Account Information:</Text>
            <Text mb="md">
              Email address, encrypted password, and account settings. This is used to sync 
              your data across devices and provide secure access.
            </Text>

            <Text fw={700} size="sm" mb="xs">B. Sensitive Cycle Data:</Text>
            <Text mb="sm">We collect the following sensitive information provided voluntarily by you:</Text>
            <List size="sm" spacing="xs" mb="md" withPadding>
              <List.Item>Physiological cycle dates (period start/end times).</List.Item>
              <List.Item>Bedikah results and timing.</List.Item>
              <List.Item>Calculated Halachic dates and required separations (Vestos).</List.Item>
              <List.Item>Custom personal notes regarding your status.</List.Item>
            </List>
            <Text size="sm" color="dimmed" style={{ fontStyle: 'italic' }}>
              We do not use this data for marketing, advertising, or profiling. It is used 
              exclusively to perform the calculations requested by you.
            </Text>
          </section>

          {/* Section 3 */}
          <section id="security">
            <Title order={3} size="h4" mb="md">3. Security & Assumption of Risk</Title>
            <Text mb="md">
              We implement industry-standard security measures, including SSL/TLS encryption for 
              data in transit and at-rest encryption for database fields. 
            </Text>
            <Paper p="md" withBorder bg="red.0" mb="md">
              <Text fw={700} size="sm" color="red.9">SECURITY WARNING:</Text>
              <Text size="sm" mt="xs">
                No method of transmission over the Internet, or method of electronic storage, 
                is 100% secure. While we strive to protect your personal information, we 
                cannot guarantee its absolute security. Any transmission of data is at your 
                own risk.
              </Text>
            </Paper>
          </section>

          {/* Section 4 */}
          <section id="user-duty">
            <Title order={3} size="h4" mb="md">4. User Responsibility & Device Security</Title>
            <Text mb="md">
              You are responsible for safeguarding the password you use to access the Service. 
              We recommend using a unique password and logging out after use on shared devices.
            </Text>
            <Text mb="md">
              <strong>Local Storage & Caching:</strong> Browsers and operating systems may 
              cache pages or store data locally. FreeMikvahCal is not responsible for the 
              security practices of your hardware, web browser, or third-party software 
              installed on your device.
            </Text>
          </section>

          {/* Section 5 */}
          <section id="third-parties">
            <Title order={3} size="h4" mb="md">5. Third-Party Disclosures & Links</Title>
            <Text mb="md">
              <strong>Service Providers:</strong> We share data with essential infrastructure 
              providers (such as AWS or Render) for the sole purpose of hosting the Service. 
              These providers are bound by strict data processing agreements.
            </Text>
            <Text>
              <strong>External Links:</strong> We are not responsible for the privacy practices 
              of third-party websites that may link to or from FreeMikvahCal. Please review 
              the privacy policies of those individual sites.
            </Text>
          </section>

          {/* Section 6 */}
          <section id="retention">
            <Title order={3} size="h4" mb="md">6. Data Rights & Retention</Title>
            <Text mb="sm">We provide all users with the following rights:</Text>
            <List size="sm" withPadding spacing="xs" mb="md">
              <List.Item><strong>Access & Export:</strong> View and export your history at any time.</List.Item>
              <List.Item><strong>Rectification:</strong> Correct or update your entries.</List.Item>
              <List.Item><strong>Erasure:</strong> Permanently delete your account and all associated data.</List.Item>
            </List>
            <Text>
              Upon account deletion, data is removed from active databases within 48 hours. 
              System backups containing your data are purged automatically after 30 days.
            </Text>
          </section>

          {/* Section 7 */}
          <section id="policy-changes">
            <Title order={3} size="h4" mb="md">7. Changes to this Policy</Title>
            <Text>
              We reserve the right to update this Privacy Policy to reflect changes in our 
              practices or legal obligations. We will notify you of any significant changes 
              by posting the new policy on this page with a revised "Last Updated" date. 
              Continued use of the Service signifies your acceptance of these changes.
            </Text>
          </section>
        </Stack>

        <Divider my="xl" />

        <Text ta="center" size="sm" c="dimmed">
          © {new Date().getFullYear()} FreeMikvahCal. All rights reserved.
          <br />
          Dedicated to providing secure tools for the Jewish community.
        </Text>
      </Container>
    </>
  );
};

export default PrivacyPolicy;