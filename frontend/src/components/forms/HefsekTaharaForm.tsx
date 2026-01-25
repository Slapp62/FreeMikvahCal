import { Button, Stack, Textarea, Select, Alert, Text } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore } from "../../store/cycleStore"
import { useUserStore } from "../../store/userStore"
import { updateCycle, getCycles } from "../../services/cycleApi"
import { useState, useEffect } from "react"
import { Cycle } from "../../store/cycleStore"
import { IconAlertTriangle, IconInfoCircle } from "../../utils/icons"
import { HebrewCalendar, HDate } from "@hebcal/core"

type HefsekTaharaValues = {
    cycleId: string;
    time: string;
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

    const { register, handleSubmit, control, setValue } = useForm<HefsekTaharaValues>({
        defaultValues: {
            time: '12:00',
            notes: '',
        }
    });
    const [timeValue, setTimeValue] = useState('12:00');

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

        // Check for Shabbat/Yom Tov mikvah (7 days after hefsek)
        const calculatedMikvahDate = new Date(hefsekDate);
        calculatedMikvahDate.setDate(calculatedMikvahDate.getDate() + 7);

        const dayOfWeek = calculatedMikvahDate.getDay();

        // Check if Friday night or Shabbat
        if (dayOfWeek === 5) { // Friday
            setShowShabbatWarning(true);
            setShabbatWarningMessage('Your mikvah date will fall on Friday night (Erev Shabbat). Please confirm this works with your mikvah\'s hours.');
        } else if (dayOfWeek === 6) { // Saturday
            setShowShabbatWarning(true);
            setShabbatWarningMessage('Your mikvah date will fall on Shabbat. Please ensure your mikvah is open on Shabbat.');
        } else {
            // Check for Jewish holidays
            try {
                const hDate = new HDate(calculatedMikvahDate);
                const holidays = HebrewCalendar.getHolidaysOnDate(hDate, false); // false for Israel

                if (holidays && holidays.length > 0) {
                    const holidayNames = holidays.map((h: any) => h.getDesc()).join(', ');
                    setShowShabbatWarning(true);
                    setShabbatWarningMessage(`Your mikvah date will fall on ${holidayNames}. Please ensure your mikvah is open.`);
                } else {
                    setShowShabbatWarning(false);
                    setShabbatWarningMessage('');
                }
            } catch (error) {
                console.error('Error checking for holidays:', error);
                setShowShabbatWarning(false);
                setShabbatWarningMessage('');
            }
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
                    timeString: timeValue,
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
                    <Alert icon={<IconAlertTriangle size={16} />} title="Too Early" color="red" w='100%'>
                        This hefsek is only {daysSincePeriod} days after your period start. Your settings require a minimum of {user?.halachicPreferences?.minimumNiddahDays || 5} days.
                        The backend will prevent this from being saved. You can change your minimum days setting in your profile preferences.
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

                <TimeInput
                    label="Time"
                    description="When was hefsek tahara performed?"
                    value={timeValue}
                    onChange={(event) => setTimeValue(event.target.value)}
                    required
                    w='100%'
                />

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
                    disabled={showMinDaysWarning}
                >
                    Add Hefsek Tahara
                </Button>
            </Stack>
        </form>
    );
}

export default HefsekTaharaForm
