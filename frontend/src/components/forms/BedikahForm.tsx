import { Button, Stack, Textarea, Select, NumberInput, Radio } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore, Cycle } from "../../store/cycleStore"
import { addBedika, getCycles } from "../../services/cycleApi"
import { useState, useEffect } from "react"

type BedikahValues = {
    cycleId: string;
    time: string;
    dayNumber: number;
    timeOfDay: 'morning' | 'evening' | 'both';
    result: 'clean' | 'questionable' | 'not_clean';
    notes?: string;
}

type Props = {
    close: () => void;
    dateClicked: string;
}

const BedikahForm = ({ close, dateClicked }: Props) => {
    const updateCycleInStore = useCycleStore((state) => state.updateCycle);
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    const [activeCycles, setActiveCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, control } = useForm<BedikahValues>({
        defaultValues: {
            time: '12:00',
            dayNumber: 1,
            timeOfDay: 'morning',
            result: 'clean',
            notes: '',
        }
    });
    const [timeValue, setTimeValue] = useState('12:00');
    //const timeOfDay = watch('timeOfDay');

    // Fetch only cycles in shiva_nekiyim status from server
    useEffect(() => {
        const fetchActiveCycles = async () => {
            try {
                const response = await getCycles({ status: 'shiva_nekiyim' });
                setActiveCycles(response.cycles);
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
    }, []);

    const cycleOptions = activeCycles.map(c => ({
        value: c._id,
        label: `Cycle from ${new Date(c.niddahOnah.start).toLocaleDateString()}`
    }));

    const onSubmit = async (formData: BedikahValues) => {
        try {
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
                    dateString: dateClicked,
                    timeString: timeValue,
                },
                dayNumber: formData.dayNumber,
                timeOfDay: formData.timeOfDay,
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

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to add bedikah',
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
                <p>No cycles in Shiva Nekiyim found. Please add a Hefsek Tahara and start Shiva Nekiyim first.</p>
            </Stack>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack align='center' justify='center' w='90%' mx='auto'>
                <Controller
                    name="cycleId"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <Select
                            label="Select Cycle"
                            placeholder="Choose which cycle"
                            required
                            w='100%'
                            data={cycleOptions}
                            {...field}
                        />
                    )}
                />

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

                <TimeInput
                    label="Time"
                    description="When was the bedikah performed?"
                    value={timeValue}
                    onChange={(event) => setTimeValue(event.target.value)}
                    required
                    w='100%'
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
                    Add Bedikah
                </Button>
            </Stack>
        </form>
    );
}

export default BedikahForm
