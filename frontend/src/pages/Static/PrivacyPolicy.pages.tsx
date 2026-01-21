import { FC } from 'react';
import { Accordion, Anchor, Container, List, Paper, Text, Title } from '@mantine/core';

const PrivacyPolicy: FC = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">
        Privacy Policy
      </Title>
      <Text c="dimmed" fs="italic" mb="xl">
        Last Updated: May 20, 2024
        <br />
        Effective Date: May 20, 2024
      </Text>

      {/* Introduction */}
      <Text mb="md">
        FreeMikvahCal is committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, share, and protect your personal and sensitive information when you use our 
        Jewish calendar and cycle tracking platform.
      </Text>
      <Text mb="md">
        By using FreeMikvahCal, you agree to the practices described in this Privacy Policy. Given 
        the sensitive nature of the data involved in Mikvah calculations, we maintain a 
        "privacy-first" approach. If you don't agree, please don't use our services.
      </Text>
      <Text mb="xl">
        This policy is designed to comply with US privacy standards and reflects our commitment to 
        safeguarding religious and personal data globally.
      </Text>

      <Accordion variant="separated" radius="md">
        {/* Data Controller */}
        <Accordion.Item value="data-controller">
          <Accordion.Control>
            <Title order={3} size="h4">
              1. Data Controller & Contact Information
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Paper p="md" withBorder mb="md">
              <Text>
                <strong>Data Controller:</strong> FreeMikvahCal Team
              </Text>
              <Text>
                <strong>Email:</strong>{' '}
                <Anchor href="mailto:support@freemikvahcal.com">support@freemikvahcal.com</Anchor>
              </Text>
            </Paper>
            <Text>
              If you have questions about how we handle your personal data, or if you want to
              exercise any of your privacy rights, contact us using the information above.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        {/* What Data We Collect */}
        <Accordion.Item value="data-collection">
          <Accordion.Control>
            <Title order={3} size="h4">
              2. What Personal & Sensitive Data We Collect
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Title order={4} size="h5" mb="xs" mt="md">
              Account Information
            </Title>
            <Text mb="sm">
              <strong>What we collect:</strong> Email address, encrypted password, and account settings.
            </Text>
            <Text mb="sm">
              <strong>Why we collect it:</strong> To sync your data across devices and provide 
              secure access to your personal calendar.
            </Text>

            <Title order={4} size="h5" mb="xs" mt="lg">
              Calendar & Cycle Data (Sensitive Information)
            </Title>
            <Text mb="sm">
              <strong>What we collect:</strong>
            </Text>
            <List mb="md">
              <List.Item>Dates and times of physiological cycles (period starts/ends)</List.Item>
              <List.Item>Bedikah results and times</List.Item>
              <List.Item>Calculated dates for Mikvah immersion and vestos (required separations)</List.Item>
              <List.Item>Custom notes regarding Halachic status</List.Item>
            </List>
            <Paper p="md" withBorder bg="blue.0" mb="md">
              <Text fw={700} mb="xs">
                Sensitive Data Notice:
              </Text>
              <Text>
                Because this data involves health and religious observance, it is treated with the 
                highest level of sensitivity. We do not use this data for marketing or profiling. 
                It is used exclusively to perform the Halachic calculations requested by you.
              </Text>
            </Paper>

            <Title order={4} size="h5" mb="xs" mt="lg">
              Technical Data
            </Title>
            <Text mb="sm">
              <strong>What we collect automatically:</strong> IP address (anonymized where possible), 
              device type, and session logs for security purposes.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Third Parties */}
        <Accordion.Item value="third-parties">
          <Accordion.Control>
            <Title order={3} size="h4">
              3. Who Receives Your Data (Third Parties)
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              We do <strong>not</strong> sell your data. We only share data with essential infrastructure 
              providers:
            </Text>
            <List mb="md">
              <List.Item><strong>Hosting:</strong> Secure US-based cloud servers (e.g., AWS or Render) to store the database.</List.Item>
              <List.Item><strong>Email Services:</strong> To send password resets or account notifications.</List.Item>
            </List>
            <Text>
              All data is encrypted in transit (SSL/TLS) and at rest.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Your Rights */}
        <Accordion.Item value="privacy-rights">
          <Accordion.Control>
            <Title order={3} size="h4">
              4. Your Privacy Rights
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              Regardless of your location, we provide the following rights to all users:
            </Text>
            <List mb="md">
              <List.Item><strong>Right to Access:</strong> View and export your entire cycle history at any time.</List.Item>
              <List.Item><strong>Right to Rectification:</strong> Edit or correct any entry in your calendar.</List.Item>
              <List.Item><strong>Right to Erasure:</strong> Delete your account and all associated data permanently.</List.Item>
            </List>
            <Text>
              To exercise these rights, navigate to your "Account Settings" or contact 
              <Anchor href="mailto:support@freemikvahcal.com"> support@freemikvahcal.com</Anchor>.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Security */}
        <Accordion.Item value="security">
          <Accordion.Control>
            <Title order={3} size="h4">
              5. How We Protect Your Sensitive Data
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb="sm">
              We implement industry-standard security measures:
            </Text>
            <List mb="md">
              <List.Item><strong>Encryption:</strong> Database fields containing sensitive cycle data are encrypted.</List.Item>
              <List.Item><strong>No Tracking:</strong> We do not use third-party analytics trackers (like Meta Pixel or Google Analytics) that could link your identity to your religious practices.</List.Item>
              <List.Item><strong>Zero-Access Goals:</strong> We strive to ensure that even our administrators cannot read your personal notes or cycle data without your explicit troubleshooting consent.</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Data Retention */}
        <Accordion.Item value="data-retention">
          <Accordion.Control>
            <Title order={3} size="h4">
              6. Data Retention
            </Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb="md">
              We keep your data only as long as your account is active. 
            </Text>
            <List mb="md">
              <List.Item>If you delete your account, all data is purged from our active database within 48 hours.</List.Item>
              <List.Item>Backups are maintained for up to 30 days before being permanently overwritten.</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Paper p="md" withBorder mt="xl" bg="gray.0">
        <Text size="sm">
          <strong>Note:</strong> FreeMikvahCal is a tool to assist in calculations. It does not 
          constitute Halachic or medical advice. Always consult with a qualified Rabbi or 
          medical professional for specific questions.
        </Text>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;