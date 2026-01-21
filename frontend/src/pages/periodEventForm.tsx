import { Button, Stack, Textarea, Select, NumberInput, Radio } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore, Cycle } from "../store/cycleStore"
import { createCycle, updateCycle, addBedika, getCycles } from "../services/cycleApi"
import { useState, useEffect } from "react"

type EventFormValues = {
    eventType: 'period_start' | 'hefsek_tahara' | 'bedikah' | 'other';
    cycleId?: string;
    time: string;
    dayNumber?: number;
    timeOfDay?: 'morning' | 'evening' | 'both';
    result?: 'clean' | 'questionable' | 'not_clean';
    notes?: string;
}

const PeriodEventForm = ({close, dateClicked} : {close: () => void; dateClicked: string}) => {
    const addCycle = useCycleStore((state) => state.addCycle);
    const updateCycleInStore = useCycleStore((state) => state.updateCycle);
    const [activeCycles, setActiveCycles] = useState<Cycle[]>([]);

    const { register, handleSubmit, watch, control } = useForm<EventFormValues>({
        defaultValues: {
            eventType: 'period_start',
            time: '12:00',
            dayNumber: 1,
            timeOfDay: 'morning',
            result: 'clean',
            notes: '',
        }
    });

    const [timeValue, setTimeValue] = useState('12:00');
    const eventType = watch('eventType');
    //const selectedCycleId = watch('cycleId');

    // Fetch active cycles based on event type
    useEffect(() => {
        const fetchActiveCycles = async () => {
            if (eventType === 'period_start' || eventType === 'other') {
                setActiveCycles([]);
                return;
            }

            try {
                // Fetch cycles based on event type needs
                let status = '';
                if (eventType === 'hefsek_tahara') {
                    status = 'niddah';
                } else if (eventType === 'bedikah') {
                    status = 'shiva_nekiyim';
                }

                const response = await getCycles({ status });
                setActiveCycles(response.cycles);
            } catch (error) {
                console.error('Error fetching active cycles:', error);
            }
        };
        fetchActiveCycles();
    }, [eventType]);

    const cycleOptions = activeCycles.map(c => ({
        value: c._id,
        label: `Cycle from ${new Date(c.niddahStartDate).toLocaleDateString()} (${c.status})`
    }));

    const onSubmit = async (formData: EventFormValues) => {
        try {
            const dateString = dateClicked;
            const timeString = timeValue;

            if (formData.eventType === 'period_start') {
                // Create new cycle
                const result = await createCycle({
                    dateString,
                    timeString,
                    notes: formData.notes,
                });

                addCycle(result.cycle);

                notifications.show({
                    title: 'Success',
                    message: 'Period start event created successfully',
                    color: 'green',
                });
            }
            else if (formData.eventType === 'hefsek_tahara') {
                // Update existing cycle with hefsek tahara date
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
                        dateString,
                        timeString,
                    },
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
            }
            else if (formData.eventType === 'bedikah') {
                // Add bedikah to existing cycle
                if (!formData.cycleId) {
                    notifications.show({
                        title: 'Error',
                        message: 'Please select a cycle',
                        color: 'red',
                    });
                    return;
                }

                const bedikaData = {
                    date: {
                        dateString,
                        timeString,
                    },
                    dayNumber: formData.dayNumber || 1,
                    timeOfDay: formData.timeOfDay || 'morning',
                    results: formData.timeOfDay === 'both'
                        ? { morning: formData.result, evening: formData.result }
                        : formData.timeOfDay === 'morning'
                        ? { morning: formData.result }
                        : { evening: formData.result },
                    notes: formData.notes,
                };

                const result = await addBedika(formData.cycleId, bedikaData);

                updateCycleInStore(formData.cycleId, {
                    bedikot: result.cycle.bedikot,
                });

                notifications.show({
                    title: 'Success',
                    message: 'Bedikah added successfully',
                    color: 'green',
                });
            }
            else if (formData.eventType === 'other') {
                // For now, just create a note-only cycle or handle differently
                // You could create a separate collection for "other events" in the future
                notifications.show({
                    title: 'Info',
                    message: 'Other events (stains, etc.) will be added in a future update',
                    color: 'blue',
                });
            }

            close();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create event';

            // Special handling for timezone error
            if (errorMessage.includes('timezone')) {
                notifications.show({
                    title: 'Profile Setup Required',
                    message: 'Please set your location/timezone in your profile settings before creating events.',
                    color: 'orange',
                });
            } else {
                notifications.show({
                    title: 'Error',
                    message: errorMessage,
                    color: 'red',
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack align='center' justify='center' w='90%' mx='auto'>
                <Controller
                    name="eventType"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Event Type"
                            placeholder="Select event type"
                            required
                            w='100%'
                            data={[
                                { value: 'period_start', label: 'Period Start' },
                                { value: 'hefsek_tahara', label: 'Hefsek Tahara' },
                                { value: 'bedikah', label: 'Bedikah' },
                                { value: 'other', label: 'Other (Stain, etc.)' },
                            ]}
                            {...field}
                        />
                    )}
                />

                {/* Cycle selector for hefsek tahara and bedikah */}
                {(eventType === 'hefsek_tahara' || eventType === 'bedikah') && (
                    <Controller
                        name="cycleId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Select Cycle"
                                placeholder="Choose which cycle to update"
                                required
                                w='100%'
                                data={cycleOptions}
                                {...field}
                            />
                        )}
                    />
                )}

                <TimeInput
                    label="Time"
                    description={
                        eventType === 'period_start' ? "When did your period start?" :
                        eventType === 'hefsek_tahara' ? "When was hefsek tahara performed?" :
                        eventType === 'bedikah' ? "When was the bedikah performed?" :
                        "Time of event"
                    }
                    value={timeValue}
                    onChange={(event) => setTimeValue(event.target.value)}
                    required
                    w='100%'
                />

                {/* Bedikah-specific fields */}
                {eventType === 'bedikah' && (
                    <>
                        <Controller
                            name="dayNumber"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    label="Day Number"
                                    description="Which day of Shiva Nekiyim (1-7)"
                                    min={1}
                                    max={7}
                                    required
                                    w='100%'
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="timeOfDay"
                            control={control}
                            render={({ field }) => (
                                <Radio.Group
                                    label="Time of Day"
                                    required
                                    {...field}
                                >
                                    <Stack mt="xs">
                                        <Radio value="morning" label="Morning" />
                                        <Radio value="evening" label="Evening" />
                                        <Radio value="both" label="Both" />
                                    </Stack>
                                </Radio.Group>
                            )}
                        />

                        <Controller
                            name="result"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Result"
                                    placeholder="Bedikah result"
                                    required
                                    w='100%'
                                    data={[
                                        { value: 'clean', label: 'Clean' },
                                        { value: 'questionable', label: 'Questionable' },
                                        { value: 'not_clean', label: 'Not Clean' },
                                    ]}
                                    {...field}
                                />
                            )}
                        />
                    </>
                )}

                <Textarea
                    label="Notes (Optional)"
                    placeholder="Enter any notes"
                    w='100%'
                    mb={10}
                    {...register('notes')}
                />

                <Button
                    type='submit'
                    color='pink'
                    fullWidth
                >
                    {eventType === 'period_start' ? 'Add Period Start' :
                     eventType === 'hefsek_tahara' ? 'Add Hefsek Tahara' :
                     eventType === 'bedikah' ? 'Add Bedikah' :
                     'Add Event'}
                </Button>
            </Stack>
        </form>
    );
}

export default PeriodEventForm