import {
  Anchor,
  Container,
  List,
  Paper,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from '@mantine/core';
import { PageMeta } from '@/SEO/PageMeta';
import { formatDate } from '@/utils/dateUtils';

export function AccessibilityStatement() {
  const computedColorScheme = useComputedColorScheme('dark');
  return (
    <>
      <PageMeta
        title="Accessibility Statement | JobRocket"
        description="JobRocket's commitment to web accessibility and WCAG 2.0 Level AA compliance"
        keywords="accessibility, WCAG, Israeli Standard 5568, screen readers"
      />

      <Container size="md" my={40}>
        <Stack gap="xl">
          <Title order={1}>Accessibility Statement</Title>

          <Text size="sm" c="dimmed">
            Last Updated: {formatDate(new Date())}
          </Text>

          <section>
            <Title order={2} size="h3" mb="md">
              Our Commitment to Accessibility
            </Title>
            <Text>
              JobRocket is committed to ensuring digital accessibility for people with disabilities.
              We are continually improving the user experience for everyone and applying the
              relevant accessibility standards to ensure we provide equal access to all of our
              users.
            </Text>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Conformance Status
            </Title>
            <Text mb="sm">
              JobRocket conforms to{' '}
              <Anchor
                href="https://www.w3.org/WAI/WCAG21/quickref/"
                target="_blank"
                rel="noopener noreferrer"
              >
                WCAG 2.0 Level AA
              </Anchor>{' '}
              and{' '}
              <Anchor
                href="https://www.gov.il/en/departments/guides/chapter_2_accessibility_guidelines"
                target="_blank"
                rel="noopener noreferrer"
              >
                Israeli Standard 5568
              </Anchor>
              . These guidelines explain how to make web content more accessible for people with
              disabilities, and user friendly for everyone.
            </Text>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Accessibility Features
            </Title>
            <Text mb="sm">JobRocket includes the following accessibility features:</Text>
            <List spacing="sm">
              <List.Item>Keyboard navigation support for all interactive elements</List.Item>
              <List.Item>Screen reader compatibility (NVDA, JAWS, VoiceOver)</List.Item>
              <List.Item>
                Descriptive ARIA labels and roles for all interactive components
              </List.Item>
              <List.Item>Semantic HTML structure with proper heading hierarchy</List.Item>
              <List.Item>
                Form fields with clear labels, error messages, and autocomplete attributes
              </List.Item>
              <List.Item>
                Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)
              </List.Item>
              <List.Item>Visible focus indicators for keyboard navigation</List.Item>
              <List.Item>Mobile zoom enabled (up to 500% without loss of functionality)</List.Item>
              <List.Item>Alternative text for images and icons</List.Item>
              <List.Item>Skip-to-content link for efficient navigation</List.Item>
              <List.Item>Screen reader announcements for dynamic content updates</List.Item>
            </List>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Assistive Technologies
            </Title>
            <Text mb="sm">
              JobRocket is designed to be compatible with the following assistive technologies:
            </Text>
            <List spacing="sm">
              <List.Item>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</List.Item>
              <List.Item>Browser zoom functionality (up to 500%)</List.Item>
              <List.Item>Keyboard-only navigation</List.Item>
              <List.Item>Voice recognition software</List.Item>
              <List.Item>Browser extensions for color adjustment and contrast</List.Item>
            </List>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Known Limitations
            </Title>
            <Text mb="sm">
              We are continually working to improve accessibility across all areas of our platform.
              Current areas of active development include:
            </Text>
            <List spacing="sm">
              <List.Item>
                Enhanced mobile touch target sizing on complex dashboard interfaces
              </List.Item>
              <List.Item>Continued refinement of dynamic content announcements</List.Item>
            </List>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Feedback and Contact Information
            </Title>
            <Text mb="sm">
              We welcome your feedback on the accessibility of JobRocket. If you encounter any
              accessibility barriers or have suggestions for improvement, please contact our
              Accessibility Coordinator:
            </Text>
            <Paper
              p="md"
              withBorder
              bg={computedColorScheme === 'light' ? 'gray.3' : 'gray.8'}
              mb="md"
            >
              <Text fw={600} mb="xs">
                Accessibility Coordinator
              </Text>
              <Text mb="xs">
                <strong>Name:</strong> Elazar Lapp
              </Text>
              <Text mb="xs">
                <strong>Email:</strong>{' '}
                <Anchor href="mailto:accessibility@jobrocket.work">
                  accessibility@jobrocket.work
                </Anchor>
              </Text>
              <Text mb="xs">
                <strong>Phone:</strong> 058-434-5797
              </Text>
              <Text mt="md" size="sm">
                <strong>Response Commitment:</strong>
              </Text>
              <List size="sm" spacing="xs">
                <List.Item>Acknowledgment of your concern within 5 business days</List.Item>
                <List.Item>Proposal for solution within 10 business days</List.Item>
              </List>
            </Paper>
            <Text>
              For general support inquiries, you can also reach us at{' '}
              <Anchor href="mailto:support@jobrocket.work">support@jobrocket.work</Anchor>
            </Text>
          </section>

          {/* CRITICAL ADDITION - Israeli Legal Requirement */}
          <section>
            <Title order={2} size="h3" mb="md">
              Formal Complaints
            </Title>
            <Text mb="sm">
              If you believe your rights have been violated or have a complaint that we have not
              adequately addressed, you have the right to lodge a complaint with the Israeli Privacy
              Protection Authority:
            </Text>
            <Text fw={600} mb="xs">
              Privacy Protection Authority
            </Text>
            <Text mb="xs">Ministry of Justice, Israel</Text>
            <Text mb="xs">
              Email: <Anchor href="mailto:privacy@justice.gov.il">privacy@justice.gov.il</Anchor>
            </Text>
            <Text mb="md">
              Website:{' '}
              <Anchor
                href="https://www.gov.il/en/departments/the_privacy_protection_authority"
                target="_blank"
                rel="noopener noreferrer"
              >
                gov.il/en/departments/the_privacy_protection_authority
              </Anchor>
            </Text>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Technical Specifications
            </Title>
            <Text>
              Accessibility of JobRocket relies on the following technologies to work with your web
              browser and any assistive technologies or plugins installed on your computer:
            </Text>
            <List spacing="sm" mt="sm">
              <List.Item>HTML5</List.Item>
              <List.Item>CSS3</List.Item>
              <List.Item>JavaScript (React 18.3)</List.Item>
              <List.Item>ARIA (Accessible Rich Internet Applications)</List.Item>
            </List>
            <Text mt="md">
              These technologies are relied upon for conformance with the accessibility standards
              used.
            </Text>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Assessment and Testing
            </Title>
            <Text>
              JobRocket has been tested using a combination of automated accessibility testing tools
              and manual testing with keyboard navigation and screen readers. We conduct regular
              accessibility audits to maintain and improve our conformance level.
            </Text>
          </section>

          <section>
            <Title order={2} size="h3" mb="md">
              Legal Compliance
            </Title>
            <Text>
              This website is in compliance with the Israeli Equal Rights for Persons with
              Disabilities Act (1998) and Israeli Standard 5568 for web accessibility. We are
              committed to maintaining this compliance and continuously improving the accessibility
              of our digital services.
            </Text>
          </section>
        </Stack>
      </Container>
    </>
  );
}
