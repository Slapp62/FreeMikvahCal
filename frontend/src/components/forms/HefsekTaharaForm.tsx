import { Button, Stack, Textarea, Select, Alert, Text, List } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore } from "../../store/cycleStore"
import { useUserStore } from "../../store/userStore"
import { updateCycle, getCycles } from "../../services/cycleApi"
import { useState, useEffect } from "react"
import { Cycle } from "../../store/cycleStore"
import { IconAlertTriangle, IconInfoCircle } from "../../utils/icons"
import { Location, Zmanim } from "@hebcal/core"

type HefsekTaharaValues = {
    cycleId: string;
    notes?: string;
}

type Props = {
    close: () => void;
    dateClicked: string;
}

const HefsekTaharaForm = ({ close, dateClicked }: Props) => {
    const updateCycleInStore = useCycleStore((state) => state.updateCycle);
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    const user = useUserStore((state) => state.user);
    const [activeCycles, setActiveCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [daysSincePeriod, setDaysSincePeriod] = useState<number>(0);
    const [showMinDaysWarning, setShowMinDaysWarning] = useState(false);
    const [showShabbatWarning, setShowShabbatWarning] = useState(false);
    const [shabbatWarningMessage, setShabbatWarningMessage] = useState('');
    const [showOldDateWarning, setShowOldDateWarning] = useState(false);
    const [sunsetTime, setSunsetTime] = useState<string>('');

    const { register, handleSubmit, control, setValue } = useForm<HefsekTaharaValues>({
        defaultValues: {
            notes: '',
        }
    });

    // Fetch only cycles in niddah status from server
    useEffect(() => {
        const fetchActiveCycles = async () => {
            try {
                const response = await getCycles({ status: 'niddah' });
                setActiveCycles(response.cycles);

                // Pre-fill with most recent cycle (first in array after sort)
                if (response.cycles.length > 0 && response.cycles[0]._id) {
                    setValue('cycleId', response.cycles[0]._id);
                    setSelectedCycle(response.cycles[0]);
                }
            } catch (error) {
                console.error('Error fetching active cycles:', error);
                notifications.show({
                    title: 'Error',
                    message: 'Failed to load active cycles',
                    color: 'red',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchActiveCycles();
    }, [setValue]);

    // Check for warnings when cycle is selected or date changes
    useEffect(() => {
        if (!selectedCycle?.niddahOnah?.start) return;

        const periodStart = new Date(selectedCycle.niddahOnah.start);
        const hefsekDate = new Date(dateClicked);
        const days = Math.ceil((hefsekDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        setDaysSincePeriod(days);

        // Check minimum niddah days
        const minDays = user?.halachicPreferences?.minimumNiddahDays || 5;
        setShowMinDaysWarning(days < minDays);

        // Check if hefsek date is very old (more than 30 days after period)
        setShowOldDateWarning(days > 30);

        // Calculate sunset time for hefsek date
        if (user?.location?.lat && user?.location?.lng && user?.location?.timezone) {
            try {
                const loc = new Location(
                    user.location.lat,
                    user.location.lng,
                    false,
                    user.location.timezone
                );
                const zmanim = new Zmanim(loc, hefsekDate, false);
                const sunset = zmanim.sunset();

                const formattedSunset = sunset.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: user.location.timezone
                });

                setSunsetTime(formattedSunset);
            } catch (error) {
                console.error('Error calculating sunset:', error);
                setSunsetTime('sunset');
            }
        } else {
            setSunsetTime('sunset');
        }

        // Check for Friday night mikvah only (7 days after hefsek)
        const calculatedMikvahDate = new Date(hefsekDate);
        calculatedMikvahDate.setDate(calculatedMikvahDate.getDate() + 7);

        const dayOfWeek = calculatedMikvahDate.getDay();

        // Check if Friday night only
        if (dayOfWeek === 5) { // Friday
            setShowShabbatWarning(true);
            setShabbatWarningMessage('Your mikvah date will fall on Friday night (Erev Shabbat). Please confirm this works with your mikvah\'s hours.');
        } else {
            setShowShabbatWarning(false);
            setShabbatWarningMessage('');
        }
    }, [selectedCycle, dateClicked, user]);

    const handleCycleSelect = (cycleId: string | null) => {
        if (cycleId) {
            const cycle = activeCycles.find(c => c._id === cycleId);
            setSelectedCycle(cycle || null);
        } else {
            setSelectedCycle(null);
        }
    };

    const cycleOptions = activeCycles
        .filter(c => c.niddahOnah?.start) // Only include cycles with valid niddahOnah
        .map(c => ({
            value: c._id,
            label: `Cycle from ${new Date(c.niddahOnah.start).toLocaleDateString()}`
        }));

    const onSubmit = async (formData: HefsekTaharaValues) => {
        try {
            if (!formData.cycleId) {
                notifications.show({
                    title: 'Error',
                    message: 'Please select a cycle',
                    color: 'red',
                });
                return;
            }

            const result = await updateCycle(formData.cycleId, {
                hefsekTaharaDate: {
                    dateString: dateClicked,
                },
                status: 'shiva_nekiyim',
                notes: formData.notes,
            });

            updateCycleInStore(formData.cycleId, {
                hefsekTaharaDate: result.cycle.hefsekTaharaDate,
                notes: formData.notes,
            });

            notifications.show({
                title: 'Success',
                message: 'Hefsek Tahara added successfully',
                color: 'green',
            });

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to add Hefsek Tahara',
                color: 'red',
            });
        }
    };

    if (loading) {
        return (
            <Stack align='center' justify='center' w='90%' mx='auto' py={20}>
                <p>Loading cycles...</p>
            </Stack>
        );
    }

    if (activeCycles.length === 0) {
        return (
            <Stack align='center' justify='center' w='90%' mx='auto' py={20}>
                <p>No active cycles found. Please create a period start event first.</p>
            </Stack>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack align='center' justify='center' w='90%' mx='auto' gap="md">
                <Controller
                    name="cycleId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select
                            label="Select Cycle"
                            placeholder="Choose which cycle to update"
                            required
                            w='100%'
                            data={cycleOptions}
                            {...field}
                            onChange={(value) => {
                                field.onChange(value);
                                handleCycleSelect(value);
                            }}
                        />
                    )}
                />

                {selectedCycle && (
                    <Text size="sm" c="dimmed" w='100%'>
                        Days since period start: {daysSincePeriod} days
                    </Text>
                )}

                {showMinDaysWarning && (
                    <Alert icon={<IconAlertTriangle size={16} />} title="Early Hefsek Warning" color="yellow" w='100%'>
                      <List>
                        <List.Item>This hefsek is only {daysSincePeriod} days after your period start.</List.Item>
                        <List.Item>Your settings recommend a minimum of {user?.halachicPreferences?.minimumNiddahDays || 5} days.</List.Item>
                        <List.Item>It is advisable to confer with a halachic authority before marking hefsek earlier than the recommended minimum.</List.Item>
                      </List>
                    </Alert>
                )}

                {showOldDateWarning && (
                    <Alert icon={<IconAlertTriangle size={16} />} title="Unusually Late" color="yellow" w='100%'>
                        This hefsek is {daysSincePeriod} days after your period start, which is longer than typical. Please verify this is correct.
                    </Alert>
                )}

                {showShabbatWarning && (
                    <Alert icon={<IconInfoCircle size={16} />} title="Mikvah Date Note" color="blue" w='100%'>
                        {shabbatWarningMessage}
                    </Alert>
                )}

                <Alert icon={<IconInfoCircle size={16} />} title="Hefsek Timing" color="blue" w='100%'>
                    Ensure hefsek was done before {sunsetTime || 'sunset'}
                </Alert>

                <Textarea
                    label="Notes (Optional)"
                    placeholder="Enter any notes"
                    w='100%'
                    mb={10}
                    {...register('notes')}
                />

                <Button
                    type='submit'
                    fullWidth
                >
                    Add Hefsek Tahara
                </Button>
            </Stack>
        </form>
    );
}

export default HefsekTaharaForm
