import { Modal, Stack, Button, Textarea, Text } from "@mantine/core"
import { EventImpl } from '@fullcalendar/core/internal';
import { notifications } from "@mantine/notifications";
import { useCycleStore } from "../store/cycleStore";
import { deleteCycle } from "../services/cycleApi";
import { useState } from "react";

type ModalProps = {
    clicked: boolean;
    close: () => void;
    selectedEvent: EventImpl | null;
};

const EditEventModal = ({clicked, close, selectedEvent} : ModalProps) => {
    if (!selectedEvent) return null;

    const deleteCycleFromStore = useCycleStore((state) => state.deleteCycle);
    const updateCycleInStore = useCycleStore((state) => state.updateCycle);
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    const cycles = useCycleStore((state) => state.cycles);

    // Extract cycle ID from event ID (format: {cycleId}-{eventType})
    const eventId = selectedEvent.id || '';
    const cycleId = selectedEvent.extendedProps?.groupID || eventId.split('-')[0];

    // Find the cycle in the store
    const cycle = cycles.find(c => c._id === cycleId);
    const [notes, setNotes] = useState(cycle?.notes || '');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleDeleteCycle = async () => {
        if (!cycleId) return;

        setIsDeleting(true);
        try {
            await deleteCycle(cycleId);
            deleteCycleFromStore(cycleId);

            notifications.show({
                title: 'Success',
                message: 'Cycle deleted successfully',
                color: 'green',
            });

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete cycle',
                color: 'red',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateNotes = async () => {
        if (!cycleId) return;

        setIsSaving(true);
        try {
            //const result = await updateCycle(cycleId, { notes });
            updateCycleInStore(cycleId, { notes });

            notifications.show({
                title: 'Success',
                message: 'Notes updated successfully',
                color: 'green',
            });

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update notes',
                color: 'red',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal opened={clicked} onClose={close} title="Edit Cycle" centered size="sm">
            <Stack>
                <Text size="sm" c="dimmed">
                    Event: {selectedEvent.title}
                </Text>

                <Textarea
                    label="Notes"
                    placeholder="Enter notes for this cycle"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    minRows={3}
                />

                <Button
                    onClick={handleUpdateNotes}
                    loading={isSaving}
                    disabled={isDeleting}
                >
                    Save Notes
                </Button>

                <Button
                    color="red"
                    onClick={handleDeleteCycle}
                    loading={isDeleting}
                    disabled={isSaving}
                >
                    Delete Entire Cycle
                </Button>

                <Button
                    variant="outline"
                    onClick={close}
                    disabled={isDeleting || isSaving}
                >
                    Cancel
                </Button>
            </Stack>
        </Modal>
    );
}

export default EditEventModal