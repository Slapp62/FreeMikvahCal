import { Modal, Stack, Select, Button, Textarea, } from "@mantine/core"
import { EventImpl } from '@fullcalendar/core/internal';
import { notifications } from "@mantine/notifications";
import { useCycleStore } from "../store/cycleStore";

type ModalProps = {
    clicked: boolean;
    close: () => void;
    selectedEvent: EventImpl | null;
};

const EditEventModal = ({clicked, close, selectedEvent} : ModalProps) => {
    if (!selectedEvent) return null;
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);

    const date = selectedEvent.start;
    if (!date) return null;
    const dateClicked = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
    const eventType = selectedEvent.title.includes('Hefsek') ? 'hefsek_date' : 'start_date';
    const onah = selectedEvent.title.includes('Night') ? 'night' : 'day';

    const handleDeleteEvent = async () => {
        try {
            // TODO: Update to use new backend cycle API
            // Need to implement deleteCycle or updateCycle endpoint

            notifications.show({
                title: 'Not Implemented',
                message: 'Event deletion needs to be updated for new backend API',
                color: 'orange',
            })

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete event',
                color: 'red',
            })
        }
    };

    const handleOnahChange = async (value: string | null) => {
        try {
            // TODO: Update to use new backend cycle API
            // Need to implement updateCycle endpoint

            notifications.show({
                title: 'Not Implemented',
                message: 'Event update needs to be updated for new backend API',
                color: 'orange',
            })

            close();
        } catch (error: any) {
            console.error("Error updating onah:", error);
        }
    };

    return (
        <Modal opened={clicked} onClose={close} title="Edit Event" centered size="xs">
            <Stack>
                <Textarea 
                    label="Notes" 
                    placeholder="Enter notes" 
                />

                <Select
                    label="Change Onah"
                    placeholder="Pick a new time"
                    disabled={selectedEvent.title.includes('Hefsek') ? true : false }
                    data={
                        [
                            { value: 'day', label: 'Before Sunset' },
                            { value: 'night', label: 'After Sunset' },
                        ]
                    }
                    onChange={handleOnahChange}
                />
                <Button color="red" onClick={handleDeleteEvent}>Delete Event</Button>
                <Button variant="outline" onClick={close}>Cancel</Button>
            </Stack>
        </Modal>
    )
}

export default EditEventModal