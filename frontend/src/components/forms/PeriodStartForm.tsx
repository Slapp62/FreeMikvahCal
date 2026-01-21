import { Button, Stack, Textarea, Radio, Group } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useForm, Controller } from "react-hook-form"
import { useCycleStore } from "../../store/cycleStore"
import { createCycle } from "../../services/cycleApi"

type PeriodStartValues = {
    onah: 'day' | 'night';
    notes?: string;
}

type Props = {
    close: () => void;
    dateClicked: string;
}

const PeriodStartForm = ({ close, dateClicked }: Props) => {
    const addCycle = useCycleStore((state) => state.addCycle);
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    
    const { register, handleSubmit, control } = useForm<PeriodStartValues>({
        defaultValues: {
            onah: 'day',
            notes: '',
        }
    });

    const onSubmit = async (formData: PeriodStartValues) => {
        // Map the radio selection to "dummy" times
        // 08:00 is safely 'Day' and 22:00 is safely 'Night' for almost all latitudes
        const timeString = formData.onah === 'day' ? '08:00' : '20:00';

        try {
            const result = await createCycle({
                dateString: dateClicked,
                timeString: timeString,
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
            notifications.show({
                title: 'Error',
                message: errorMessage,
                color: 'red',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack align='center' justify='center' w='90%' mx='auto' gap="md">
                <Controller
                    name="onah"
                    control={control}
                    render={({ field }) => (
                        <Radio.Group
                            label="Time of Day"
                            description="Did the period start before or after sunset?"
                            required
                            {...field}
                            w='100%'
                        >
                            <Group mt="xs">
                                <Radio value="day" label="Before Sunset (Day)" />
                                <Radio value="night" label="After Sunset (Night)" />
                            </Group>
                        </Radio.Group>
                    )}
                />

                <Textarea
                    label="Notes (Optional)"
                    placeholder="Enter any notes"
                    w='100%'
                    mb={10}
                    {...register('notes')}
                />

                <Button type='submit' fullWidth>
                    Add Period Start
                </Button>
            </Stack>
        </form>
    );
}

export default PeriodStartForm;