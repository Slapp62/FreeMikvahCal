import {
    Stack,
    Title,
    Text,
    Button,
    Container,
    Grid,
    Card,
    Group,
    Box,
    ThemeIcon,
    SimpleGrid,
} from "@mantine/core";
import {
    IconCalendarEvent,
    IconBell,
    IconSettings,
    IconClock,
    IconCurrencyDollar,
    IconShieldLock,
    IconNumber1,
    IconNumber2,
    IconNumber3,
    IconNumber4,
    IconSparkles,
    IconHeart,
} from "../utils/icons";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <Box>
            {/* Hero Section */}
            <Box
                py={80}
                style={{
                    background: 'linear-gradient(135deg, light-dark(var(--mantine-color-pink-3), var(--mantine-color-dark-9)) 0%,  light-dark(var(--mantine-color-purple-3), var(--mantine-color-dark-9)) 100%)',
                }}
            >
                <Container size="lg">
                    <Stack align="center" gap="xl">
                        <Title
                            order={1}
                            ta="center"
                            c="pink.7"
                            fw={800}
                            style={{background: 'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                        >
                            The Free Mikvah Calendar
                        </Title>
                        <Title order={2} ta="center" c="pink.6" fw={500} style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)' }}>
                            Making family purity easy for everyone
                        </Title>
                        <Text size="xl" ta="center" c="pink.8" maw={700}>
                            Automatically calculate halachic dates, track your cycle, and receive reminders
                            — all customized to your minhagim. 100% free, forever.
                        </Text>
                        <Group gap="md" mt="md" justify="center" wrap="wrap">
                            <Button
                                component={Link}
                                to="/register"
                                size="xl"
                                radius="md"
                                variant="white"
                                c="pink.6"
                                style={{
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                Get Started Free
                            </Button>
                            <Button
                                component={Link}
                                to="/about"
                                size="xl"
                                radius="md"
                                variant="subtle"
                                c="pink.6"
                                style={{
                                    borderColor: 'pink.6',
                                    borderWidth: 2,
                                }}
                            >
                                Learn More
                            </Button>
                        </Group>
                        <Text size="sm" c="pink.8" mt="xs">
                            Join hundreds of women tracking their cycles with confidence
                        </Text>
                    </Stack>
                </Container>
            </Box>

            {/* Features Section */}
            <Container size="lg" py={80}>
                <Stack align="center" mb={60}>
                    <Title order={2} size="2.5rem" ta="center" c="secondary">
                        Everything You Need
                    </Title>
                    <Text size="lg" ta="center" c="dimmed" maw={600}>
                        Powerful features designed to make halachic tracking simple, accurate, and stress-free
                    </Text>
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="pink">
                                <IconCalendarEvent size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                Auto-Calculate Dates
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                Automatically calculate hefsek tahara, shiva nekiyim, mikvah dates, and vest
                                onahs based on halacha
                            </Text>
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="purple">
                                <IconBell size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                Email Reminders
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                Never miss an important date with optional email notifications for upcoming
                                events
                            </Text>
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="indigo">
                                <IconSettings size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                Your Minhagim
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                Customize calculations for Ashkenazi, Sephardi, Teimani traditions and
                                special onahs
                            </Text>
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="pink">
                                <IconClock size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                Timezone Aware
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                Accurate calculations based on your location and timezone, anywhere in the
                                world
                            </Text>
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="purple">
                                <IconCurrencyDollar size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                100% Free
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                No hidden fees, no premium tiers, no paywalls. All features are completely
                                free forever
                            </Text>
                        </Stack>
                    </Card>

                    <Card shadow="sm" padding="xl" radius="md">
                        <Stack align="center" gap="md">
                            <ThemeIcon size={60} radius="md" variant="light" color="indigo">
                                <IconShieldLock size={32} />
                            </ThemeIcon>
                            <Title order={3} size="h3" ta="center">
                                Secure & Private
                            </Title>
                            <Text size="sm" c="dimmed" ta="center">
                                Your personal data is encrypted and secure. We respect your privacy above all
                            </Text>
                        </Stack>
                    </Card>
                </SimpleGrid>
            </Container>

            {/* How It Works Section */}
            <Box style={{ background: 'linear-gradient(135deg, light-dark(var(--mantine-color-pink-3), var(--mantine-color-dark-9)) 0%,  light-dark(var(--mantine-color-purple-3), var(--mantine-color-gray-9)) 100%)' }} py={80}>
                <Container size="lg">
                    <Stack align="center" mb={60}>
                        <Title order={2} size="2.5rem" ta="center" c="secondary">
                            How It Works
                        </Title>
                        <Text size="lg" ta="center" c="dimmed" maw={600}>
                            Get started in minutes with our simple, straightforward process
                        </Text>
                    </Stack>

                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                        <Card shadow="sm" padding="lg" radius="md" bg="white">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                                    <IconNumber1 size={32} />
                                </ThemeIcon>
                                <Title order={4} size="h4" ta="center">
                                    Sign Up Free
                                </Title>
                                <Text size="sm" c="dimmed" ta="center">
                                    Create your account with just your email and location
                                </Text>
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" bg="white">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                                    <IconNumber2 size={32} />
                                </ThemeIcon>
                                <Title order={4} size="h4" ta="center">
                                    Set Preferences
                                </Title>
                                <Text size="sm" c="dimmed" ta="center">
                                    Choose your minhagim and customize special onahs
                                </Text>
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" bg="white">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                                    <IconNumber3 size={32} />
                                </ThemeIcon>
                                <Title order={4} size="h4" ta="center">
                                    Track Your Cycle
                                </Title>
                                <Text size="sm" c="dimmed" ta="center">
                                    Add cycle events and let us calculate the rest
                                </Text>
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" bg="white">
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'pink', to: 'purple' }}>
                                    <IconNumber4 size={32} />
                                </ThemeIcon>
                                <Title order={4} size="h4" ta="center">
                                    Stay Informed
                                </Title>
                                <Text size="sm" c="dimmed" ta="center">
                                    Receive reminders and view your personalized calendar
                                </Text>
                            </Stack>
                        </Card>
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Benefits Section */}
            <Container size="lg" py={80}>
                <Grid gutter="xl" align="center">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="lg">
                            <ThemeIcon size={60} radius="md" variant="light" color="pink">
                                <IconSparkles size={32} />
                            </ThemeIcon>
                            <Title order={2} size="2rem" c="secondary">
                                Respects Your Tradition
                            </Title>
                            <Text size="lg" c="dimmed">
                                Unlike one-size-fits-all apps, we understand that different communities follow
                                different halachic practices. Customize calculations for Ashkenazi, Sephardi,
                                or Teimani traditions, plus special onahs like Onat Ohr Zarua.
                            </Text>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box
                            h={300}
                            bg="gradient"
                            style={{
                                background: 'linear-gradient(135deg, var(--mantine-color-purple-1) 0%, var(--mantine-color-pink-1) 100%)',
                                borderRadius: 'var(--mantine-radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <IconSettings size={120} stroke={1.5} color="var(--mantine-color-purple-4)" />
                        </Box>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 2, md: 1 }}>
                        <Box
                            h={300}
                            bg="gradient"
                            style={{
                                background: 'linear-gradient(135deg, var(--mantine-color-pink-1) 0%, var(--mantine-color-indigo-1) 100%)',
                                borderRadius: 'var(--mantine-radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <IconHeart size={120} stroke={1.5} color="var(--mantine-color-pink-4)" />
                        </Box>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }} order={{ base: 1, md: 2 }}>
                        <Stack gap="lg">
                            <ThemeIcon size={60} radius="md" variant="light" color="purple">
                                <IconShieldLock size={32} />
                            </ThemeIcon>
                            <Title order={2} size="2rem" c="secondary">
                                Your Privacy Matters
                            </Title>
                            <Text size="lg" c="dimmed">
                                We take your privacy seriously. Your personal health data is encrypted and
                                stored securely. We only collect what's necessary (location for timezone) and
                                never share your information with third parties.
                            </Text>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>

            {/* Final CTA Section */}
            <Box
                py={80}
                style={{
                    background: 'linear-gradient(135deg, light-dark(var(--mantine-color-purple-6), var(--mantine-color-dark-9)) 0%,  light-dark(var(--mantine-color-indigo-6), var(--mantine-color-dark-9)) 100%)',
                }}
            >
                <Container size="md">
                    <Stack align="center" gap="xl">
                        <Title order={2} size="2.5rem" ta="center" c="white" fw={700}>
                            Ready to Simplify Your Tracking?
                        </Title>
                        <Text size="xl" ta="center" c="white" maw={600}>
                            Join our community today and experience stress-free halachic cycle tracking
                        </Text>
                        <Group gap="md" justify="center" wrap="wrap">
                            <Button
                                component={Link}
                                to="/register"
                                size="xl"
                                radius="md"
                                variant="white"
                                c="purple.6"
                                style={{
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                Start Free Today
                            </Button>
                            <Button
                                component={Link}
                                to="/about"
                                size="xl"
                                radius="md"
                                variant="outline"
                                c="white"
                                style={{
                                    borderColor: 'white',
                                    borderWidth: 2,
                                }}
                            >
                                Learn More
                            </Button>
                        </Group>
                        <Text size="sm" c="purple.0">
                            No credit card required • Always free • Get started in 2 minutes
                        </Text>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;