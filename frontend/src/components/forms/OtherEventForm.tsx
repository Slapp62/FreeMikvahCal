import { Button, Stack, Textarea } from "@mantine/core"
import { TimeInput } from "@mantine/dates"
import { notifications } from "@mantine/notifications"
import { useForm } from "react-hook-form"
import { useState } from "react"

type OtherEventValues = {
    time: string;
    notes: string;
}

type Props = {
    close: () => void;
    dateClicked: string;
}

const OtherEventForm = ({ close, dateClicked }: Props) => {
    const { register, handleSubmit } = useForm<OtherEventValues>({
        defaultValues: {
            time: '12:00',
            notes: '',
        }
    });
    const [timeValue, setTimeValue] = useState('12:00');

    const onSubmit = async (formData: OtherEventValues) => {
        // TODO: Implement API endpoint for other events (stains, etc.)
        // For now, just show info message
        notifications.show({
            title: 'Coming Soon',
            message: 'Tracking for other events (stains, etc.) will be added in a future update. For now, you can use notes on your cycles.',
            color: 'blue',
            autoClose: 8000,
        });

        close();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack align='center' justify='center' w='90%' mx='auto'>
                <TimeInput
                    label="Time of Event"
                    description="When did this occur?"
                    value={timeValue}
                    onChange={(event) => setTimeValue(event.target.value)}
                    required
                    w='100%'
                />

                <Textarea
                    label="Description"
                    description="Describe what happened (e.g., stain, spotting)"
                    placeholder="Enter details about this event"
                    required
                    w='100%'
                    minRows={3}
                    mb={10}
                    {...register('notes', { required: true })}
                />

                <Button
                    type='submit'
                    color='pink'
                    fullWidth
                >
                    Save Event
                </Button>
            </Stack>
        </form>
    );
}

export default OtherEventForm
