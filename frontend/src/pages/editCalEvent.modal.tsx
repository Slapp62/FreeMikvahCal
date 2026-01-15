import { Modal, Stack, Select, Button, Textarea, } from "@mantine/core"
import { supabase } from "../lib/supabaseClient.ts";
import useZStore from "../Zstore.ts/index.ts";
import { EventImpl } from '@fullcalendar/core/internal';
import { notifications } from "@mantine/notifications";

type ModalProps = {
    clicked: boolean;
    close: () => void;
    selectedEvent: EventImpl | null;
};

const EditEventModal = ({clicked, close, selectedEvent} : ModalProps) => {
    if (!selectedEvent) return null;
    const removeEvent = useZStore((state) => state.removeEvent);
    const refetch = useZStore((state) => state.toggleRefetchFlag);
    
    const date = selectedEvent.start;
    if (!date) return null;
    const dateClicked = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
    const eventType = selectedEvent.title.includes('Hefsek') ? 'hefsek_date' : 'start_date';
    const onah = selectedEvent.title.includes('Night') ? 'night' : 'day';
    
    const handleDeleteEvent = async () => {
        
        const {data, error: dbError} = await supabase.rpc('delete_period_event', {
            event_type: eventType,
            selected_date: dateClicked,
            ...(onah && {selected_onah: onah}),
        })

        if (dbError?.message) {
            console.log('Error deleting event:', dbError.message)
            return
        };

        if (data[0].success) {
            notifications.show({
                title: 'Success',
                message: 'Event deleted successfully',
                color: 'green',
            })
            refetch();
            removeEvent(selectedEvent)
        } else {
            notifications.show({
                title: 'Error',
                message: `${data[0].message}`,
                color: 'red',
            })
        }
        close();
        
    };

    const handleOnahChange = async (value: string | null) => {
        close();
        const { error } = await supabase
            .from("periods")
            .update({ onah: value })
            .eq('start_date', selectedEvent.start?.toLocaleString());
        if (error) {
            console.error("Error updating onah:", error);
            return;
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