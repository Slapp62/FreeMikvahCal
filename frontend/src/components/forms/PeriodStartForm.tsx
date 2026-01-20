import { Button, Stack, Textarea } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm } from "react-hook-form"
import { useCycleStore } from "../../store/cycleStore"
import { createCycle } from "../../services/cycleApi"
import { useState } from "react"

type PeriodStartValues = {
    time: string;
    notes?: string;
}

type Props = {
    close: () => void;
    dateClicked: string;
}

const PeriodStartForm = ({ close, dateClicked }: Props) => {
    const addCycle = useCycleStore((state) => state.addCycle);
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    const { register, handleSubmit } = useForm<PeriodStartValues>({
        defaultValues: {
            time: '12:00',
            notes: '',
        }
    });
    const [timeValue, setTimeValue] = useState('12:00');

    const onSubmit = async (formData: PeriodStartValues) => {
        try {
            const result = await createCycle({
                dateString: dateClicked,
                timeString: timeValue,
                notes: formData.notes,
            });

            addCycle(result.cycle);

            notifications.show({
                title: 'Success',
                message: 'Period start event created successfully',
                color: 'green',
            });

            triggerRefetch();
            close();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create event';

            // Special handling for location errors
            if (errorMessage.toLowerCase().includes('location') ||
                errorMessage.toLowerCase().includes('timezone')) {
                notifications.show({
                    title: 'Profile Setup Required',
                    message: 'Please set your location (city and timezone) in your profile settings before creating events.',
                    color: 'orange',
                    autoClose: 8000,
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
                <TimeInput
                    label="Time of Day"
                    description="When did your period start?"
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
                    Add Period Start
                </Button>
            </Stack>
        </form>
    );
}

export default PeriodStartForm
