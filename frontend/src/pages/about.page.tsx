import { Container, Title, Text, Stack, Paper } from '@mantine/core';

export default function AboutPage() {
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="md">
          <Title order={1}>About FreeMikvahCal</Title>

          <Text>
            FreeMikvahCal is a dedicated calendar application designed to help Jewish women
            track their Niddah cycle and mikvah dates according to Jewish law (Halacha).
          </Text>

          <Title order={2} mt="md">Features</Title>
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
            <br />
            - Email reminders (optional)
          </Text>

          <Title order={2} mt="md">Privacy & Data</Title>
          <Text>
            Your data is stored securely and privately. We only collect the minimum information
            necessary to provide accurate calculations based on your location's timezone and
            Jewish calendar dates.
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
