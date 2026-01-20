import { Button, Stack, Textarea, Select } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore } from "../../store/cycleStore"
import { updateCycle, getCycles } from "../../services/cycleApi"
import { useState, useEffect } from "react"
import { Cycle } from "../../store/cycleStore"

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
    const [activeCycles, setActiveCycles] = useState<Cycle[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, control } = useForm<HefsekTaharaValues>({
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
        label: `Cycle from ${new Date(c.niddahStartDate).toLocaleDateString()}`
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
            <Stack align='center' justify='center' w='90%' mx='auto'>
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
                        />
                    )}
                />

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
                >
                    Add Hefsek Tahara
                </Button>
            </Stack>
        </form>
    );
}

export default HefsekTaharaForm
