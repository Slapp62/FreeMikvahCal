import { Container, Title, Paper, Stack, Checkbox, Button, Text, Divider, Alert, NumberInput, Autocomplete, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState, useEffect, ChangeEvent } from "react";
import { useUserStore } from "../store/userStore";
import { updateCurrentUser, getCurrentUser } from "../services/userApi";
import { searchLocations, Location } from "../services/locationApi";
import { IconInfoCircle, IconMapPin } from "../utils/icons";

const EditUserSettings = () => {
    //const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Local state for halachic preferences
    const [ohrZaruah, setOhrZaruah] = useState(false);
    const [kreisiUpleisi, setKreisiUpleisi] = useState(false);
    const [chasamSofer, setChasamSofer] = useState(false);
    const [minimumNiddahDays, setMinimumNiddahDays] = useState(5);

    // Local state for location
    const [currentLocation, setCurrentLocation] = useState<string>('');
    const [currentTimezone, setCurrentTimezone] = useState<string>('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [locationModalOpened, setLocationModalOpened] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

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
                setMinimumNiddahDays(userData.halachicPreferences?.minimumNiddahDays || 5);

                // Set location data
                if (userData.location) {
                    const cityDisplay = userData.location.state
                        ? `${userData.location.city}, ${userData.location.state}`
                        : `${userData.location.city}`;
                    setCurrentLocation(cityDisplay);
                    setCurrentTimezone(userData.location.timezone || 'UTC');
                }
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

    // Load locations for autocomplete
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const response = await searchLocations();
                setLocations(response.locations);
            } catch (error) {
                console.error('Error loading locations:', error);
            }
        };
        loadLocations();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateCurrentUser({
                halachicPreferences: {
                    ohrZaruah,
                    kreisiUpleisi,
                    chasamSofer,
                    minimumNiddahDays,
                },
            });

            updateUser(result.user);

            notifications.show({
                title: 'Success',
                message: 'Your halachic preferences have been updated. These will apply to all new cycles.',
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

    const handleLocationUpdate = async () => {
        const selected = locations.find((loc: Location) => loc.value === selectedLocation);

        if (!selected) {
            notifications.show({
                title: 'Validation Error',
                message: 'Please select a valid location',
                color: 'red',
            });
            return;
        }

        setLocationLoading(true);
        try {
            const result = await updateCurrentUser({
                location: {
                    city: selected.value,
                    geonameId: selected.geonameId,
                    lat: selected.lat,
                    lng: selected.lng,
                    timezone: selected.timezone || 'UTC',
                },
            });

            updateUser(result.user);

            // Update display
            const cityDisplay = selected.state
                ? `${selected.value}, ${selected.state}`
                : selected.value;
            setCurrentLocation(cityDisplay);
            setCurrentTimezone(selected.timezone || 'UTC');
            setLocationModalOpened(false);
            setSelectedLocation('');

            notifications.show({
                title: 'Location Updated',
                message: 'Your location has been updated. Future cycles will use sunrise/sunset times for your new location.',
                color: 'green',
            });
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update location',
                color: 'red',
            });
        } finally {
            setLocationLoading(false);
        }
    };

    // Generate location options for autocomplete
    const locationOptions = locations.map((loc) => {
        const label = loc.state
            ? `${loc.value}, ${loc.state}, ${loc.country}`
            : `${loc.value}, ${loc.country}`;
        return label;
    });

    if (isFetching) {
        return (
            <Container size="sm" py={40}>
                <Text ta="center">Loading settings...</Text>
            </Container>
        );
    }

    return (
        <Container size="sm" py={40}>
            <Title order={2} mb={30}>User Settings</Title>

            {/* Location Settings Section */}
            <Title order={3} mb={15}>Location Settings</Title>
            <Alert icon={<IconInfoCircle size={16} />} color="blue" mb={15}>
                Your location is used to calculate accurate sunrise and sunset times for Hebrew calendar calculations.
            </Alert>

            <Paper shadow="sm" p="lg" withBorder mb={30}>
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <div style={{ flex: 1 }}>
                            <Text size="sm" fw={500} mb={8}>Current Location</Text>
                            <Stack gap={6}>
                                <Group gap="xs">
                                    <IconMapPin size={16} />
                                    <Text size="sm" c="dimmed">{currentLocation || 'Not set'}</Text>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Timezone: {currentTimezone}
                                </Text>
                                <Text size="xs" c="dimmed" mt={4} style={{ fontStyle: 'italic' }}>
                                    Used for calculating Hebrew day boundaries (sunset to sunset) and onah periods (sunrise/sunset)
                                </Text>
                            </Stack>
                        </div>
                        <Button
                            variant="light"
                            color="pink"
                            onClick={() => setLocationModalOpened(true)}
                        >
                            Change Location
                        </Button>
                    </Group>
                </Stack>
            </Paper>

            {/* Halachic Preferences Section */}
            <Title order={3} mb={15}>Halachic Preferences</Title>
            <Alert icon={<IconInfoCircle size={16} />} color="blue" mb={15}>
                These stringencies will automatically apply to all new cycles you create.
                Existing cycles will not be affected.
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

                    <Divider />

                    <div>
                        <NumberInput
                            label="Minimum Niddah Days"
                            description="Minimum number of days required before Hefsek Tahara"
                            value={minimumNiddahDays}
                            onChange={(value) => setMinimumNiddahDays(Number(value))}
                            min={4}
                            max={10}
                            step={1}
                            allowDecimal={false}
                        />
                        <Text size="xs" c="dimmed" mt={5}>
                            Halacha typically requires at least 4-5 days from the start of your period before performing Hefsek Tahara.
                            This setting will prevent you from entering a Hefsek Tahara date that is too early.
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

            {/* Location Update Modal */}
            <Modal
                opened={locationModalOpened}
                onClose={() => {
                    setLocationModalOpened(false);
                    setSelectedLocation('');
                }}
                title="Change Your Location"
                size="md"
            >
                <Stack gap="md">
                    <Alert icon={<IconInfoCircle size={16} />} color="yellow">
                        Changing your location will update your timezone and affect all future astronomical calculations (sunrise, sunset, etc.).
                        Existing cycles will not be recalculated.
                    </Alert>

                    <Autocomplete
                        label="Select New Location"
                        placeholder="Start typing to search cities..."
                        data={locationOptions}
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        limit={100}
                        required
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="subtle"
                            onClick={() => {
                                setLocationModalOpened(false);
                                setSelectedLocation('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="pink"
                            onClick={handleLocationUpdate}
                            loading={locationLoading}
                            disabled={!selectedLocation}
                        >
                            Update Location
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
};

export default EditUserSettings;
