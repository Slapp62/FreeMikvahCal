import { Container, Title, Paper, Stack, Checkbox, Button, Text, Divider, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect, ChangeEvent } from "react";
import { useUserStore } from "../store/userStore";
import { updateCurrentUser, getCurrentUser } from "../services/userApi";
import { IconInfoCircle } from "@tabler/icons-react";

const EditUserSettings = () => {
    //const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Local state for halachic preferences
    const [ohrZaruah, setOhrZaruah] = useState(false);
    const [kreisiUpleisi, setKreisiUpleisi] = useState(false);
    const [chasamSofer, setChasamSofer] = useState(false);

    // Fetch current user data on mount to get latest preferences
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await getCurrentUser();
                updateUser(userData);

                // Set local state from fetched data
                setOhrZaruah(userData.halachicPreferences?.ohrZaruah || false);
                setKreisiUpleisi(userData.halachicPreferences?.kreisiUpleisi || false);
                setChasamSofer(userData.halachicPreferences?.chasamSofer || false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load user settings',
                    color: 'red',
                });
            } finally {
                setIsFetching(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateCurrentUser({
                halachicPreferences: {
                    ohrZaruah,
                    kreisiUpleisi,
                    chasamSofer,
                },
            });

            updateUser(result.user);

            notifications.show({
                title: 'Success',
                message: 'Your halachic preferences have been updated and applied to all your cycles.',
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update settings',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return (
            <Container size="sm" py={40}>
                <Text ta="center">Loading settings...</Text>
            </Container>
        );
    }

    return (
        <Container size="sm" py={40}>
            <Title order={2} mb={20}>Halachic Preferences</Title>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" mb={20}>
                These stringencies will automatically apply to all your cycles, including existing ones.
            </Alert>

            <Paper shadow="sm" p="lg" withBorder>
                <Stack gap="lg">
                    <div>
                        <Checkbox
                            label="Ohr Zaruah"
                            description="Separate on the preceding onah (opposite time of day/night) for all vesetim"
                            checked={ohrZaruah}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setOhrZaruah(event.currentTarget.checked)}
                        />
                        <Text size="xs" c="dimmed" mt={5} ml={28}>
                            Example: If your period started during the day, you would also separate the night before each veset.
                        </Text>
                    </div>

                    <Divider />

                    <div>
                        <Checkbox
                            label="Kreisi U'Pleisi"
                            description="Observe both day and night on day 30 (24-hour Onah Beinonit)"
                            checked={kreisiUpleisi}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setKreisiUpleisi(event.currentTarget.checked)}
                        />
                        <Text size="xs" c="dimmed" mt={5} ml={28}>
                            In addition to the matching onah on day 30, also observe the opposite onah on day 30.
                        </Text>
                    </div>

                    <Divider />

                    <div>
                        <Checkbox
                            label="Beinonit 31"
                            description="Also observe day 31 in addition to day 30"
                            checked={chasamSofer}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => setChasamSofer(event.currentTarget.checked)}
                        />
                        <Text size="xs" c="dimmed" mt={5} ml={28}>
                            Observe the matching onah on both day 30 and day 31 from the start of your period.
                        </Text>
                    </div>

                    <Button
                        onClick={handleSave}
                        loading={loading}
                        color="pink"
                        fullWidth
                        mt="md"
                    >
                        Save Preferences
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
};

export default EditUserSettings;
