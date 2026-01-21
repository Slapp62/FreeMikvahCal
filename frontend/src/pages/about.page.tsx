import { FC, useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import { IconBriefcase, IconUsers, IconWorld } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  useComputedColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

const AboutPage: FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const computedColorScheme = useComputedColorScheme('light');

  // Theme-aware colors
  const pageBg = computedColorScheme === 'light' ? 'white' : 'rocketBlack.8';

  // Scroll to contact form if hash is present in URL
  useEffect(() => {
    if (location.hash === '#contact') {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const element = document.getElementById('contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) =>
        !/^\S+@\S+\.\S+$/.test(value) ? 'Please enter a valid email address' : null,
      subject: (value) => (value.trim().length === 0 ? 'Subject is required' : null),
      message: (value) =>
        value.trim().length < 10 ? 'Message must be at least 10 characters' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Replace with your EmailJS service ID, template ID, and public key
    const serviceID = 'service_5zblm38';
    const templateID = 'template_itsqp9u';
    const publicKey = 'a6IxywqmqlHjFDfxD';

    setIsSubmitting(true);
    emailjs
      .send(serviceID, templateID, values, publicKey)
      .then(() => {
        notifications.show({
          title: 'Success',
          message: 'Message sent successfully!',
          color: 'green',
        });
        form.reset();
      })
      .catch((error: any) => {
        notifications.show({
          title: 'Error',
          message: `Failed to send the message, please try again. ${error.message}`,
          color: 'red',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Box bg={pageBg} style={{ paddingBottom: '40px' }}>
      <Container size="md" py="xl">
        <Paper shadow="sm" p="xl" radius="md" my="xl">
          <Stack gap="md">
            <Title order={1}>About FreeMikvahCal</Title>

            <Text>
              FreeMikvahCal is a dedicated calendar application designed to help Jewish women track
              their Niddah cycle and mikvah dates according to Jewish law (Halacha).
            </Text>

            <Title order={2} mt="md">
              Features
            </Title>
            <Text>
              - Track niddah start dates
              <br />
              - Calculate hefsek tahara dates
              <br />
              - Track shiva nekiyim (seven clean days)
              <br />
              - Calculate mikvah dates
              <br />
              - Vest onot reminders (yom hachodesh, onah beinonit, haflagah)
              <br />
              - Timezone-aware calculations
              <br />- Email reminders (optional)
            </Text>

            <Title order={2} mt="md">
              Privacy & Data
            </Title>
            <Text>
              Your data is stored securely and privately. We only collect the minimum information
              necessary to provide accurate calculations based on your location's timezone and
              Jewish calendar dates.
            </Text>
          </Stack>
        </Paper>

        <Flex direction={{ base: 'column', md: 'row' }} gap="lg" justify="center" align="stretch">
          <Stat icon={<IconBriefcase size={24} />} label="AI-Powered Matching" value="Smart" />
          <Stat icon={<IconUsers size={24} />} label="Job Seekers & Employers" value="Connected" />
          <Stat icon={<IconWorld size={24} />} label="Intuitive & Easy to Use" value="Interface" />
        </Flex>
        <form onSubmit={form.onSubmit(handleSubmit)} id="contact">
          <Title
            mt={30}
            order={2}
            size="h1"
            style={{ fontFamily: 'Outfit, var(--mantine-font-family)' }}
            fw={700}
            ta="center"
          >
            Get in touch
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
            <TextInput
              label="Name"
              placeholder="Your name"
              name="name"
              variant="filled"
              required
              withAsterisk
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Email"
              placeholder="Your email"
              name="email"
              variant="filled"
              required
              withAsterisk
              {...form.getInputProps('email')}
            />
          </SimpleGrid>
          <TextInput
            label="Subject"
            placeholder="Subject"
            mt="md"
            name="subject"
            variant="filled"
            required
            withAsterisk
            {...form.getInputProps('subject')}
          />
          <Textarea
            mt="md"
            label="Message"
            placeholder="Your message"
            maxRows={10}
            minRows={5}
            autosize
            name="message"
            variant="filled"
            required
            withAsterisk
            {...form.getInputProps('message')}
          />
          <Group justify="center" mt="xl">
            <Button type="submit" size="md" loading={isSubmitting} c="white">
              Send message
            </Button>
          </Group>
        </form>
      </Container>
    </Box>
  );
};

type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const Stat: FC<StatProps> = ({ icon, label, value }) => {
  const computedColorScheme = useComputedColorScheme('light');
  const cardBg = computedColorScheme === 'light' ? 'rocketGray.2' : 'rocketBlack.9';

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      withBorder
      bg={cardBg}
      style={{
        border:
          computedColorScheme === 'light'
            ? '1px solid lightgray'
            : '2px solid var(--mantine-color-rocketBlack-9)',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Group>
        <ThemeIcon variant="light" size="lg" radius="xl" color="rocketOrange">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="lg" fw={500}>
            {value}
          </Text>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
        </div>
      </Group>
    </Paper>
  );
};

export default AboutPage;
