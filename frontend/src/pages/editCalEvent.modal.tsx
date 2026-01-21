import { Modal, Stack, Button, Textarea, Text, Group, Divider } from "@mantine/core"
import { EventImpl } from '@fullcalendar/core/internal';
import { notifications } from "@mantine/notifications";
import { useCycleStore } from "../store/cycleStore";
import { useUserStore } from "../store/userStore";
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
    const user = useUserStore((state) => state.user);

    // Extract cycle ID from event ID (format: {cycleId}-{eventType})
    const eventId = selectedEvent.id || '';
    const cycleId = selectedEvent.extendedProps?.groupID || eventId.split('-')[0];

    // Find the cycle in the store
    const cycle = cycles.find(c => c._id === cycleId);
    const [notes, setNotes] = useState(cycle?.notes || '');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Detect event type and onah information
    const eventStart = selectedEvent.start ? new Date(selectedEvent.start) : null;
    const eventEnd = selectedEvent.end ? new Date(selectedEvent.end) : null;
    const classNames = selectedEvent.classNames || [];

    // Check if this is a period start event (only these can be deleted)
    const isPeriodStart = classNames.some(cn => cn.includes('niddah-start'));

    // Calculate onah type from time range (for events with start and end times)
    let onahType: 'day' | 'night' | null = null;
    let onahIcon = '';

    if (eventStart && eventEnd) {
        const startDate = eventStart.toDateString();
        const endDate = eventEnd.toDateString();

        // Day onah: start and end on same Gregorian day (sunrise to sunset)
        // Night onah: spans two Gregorian days (sunset to next sunrise)
        if (startDate === endDate) {
            onahType = 'day';
            onahIcon = '☀️';
        } else {
            onahType = 'night';
            onahIcon = '🌙';
        }
    }

    // Format time in user's timezone
    const formatTime = (date: Date) => {
        if (!user?.location?.timezone) {
            return date.toLocaleTimeString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
        return date.toLocaleTimeString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: user.location.timezone
        });
    };

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
        <Modal opened={clicked} onClose={close} title="Event Details" centered size="md">
            <Stack>
                <Text size="lg" fw={600}>
                    {selectedEvent.title}
                </Text>

                {/* Show onah time information for onah events */}
                {eventStart && eventEnd && onahType && (
                    <Stack gap="xs">
                        <Divider />
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>Onah Type:</Text>
                            <Text size="sm">{onahIcon} {onahType === 'day' ? 'Day Onah' : 'Night Onah'}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>Start Time:</Text>
                            <Text size="sm">{formatTime(eventStart)}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>End Time:</Text>
                            <Text size="sm">{formatTime(eventEnd)}</Text>
                        </Group>
                        <Divider />
                    </Stack>
                )}

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

                {/* Only show delete button for period start events */}
                {isPeriodStart && (
                    <Button
                        color="red"
                        onClick={handleDeleteCycle}
                        loading={isDeleting}
                        disabled={isSaving}
                    >
                        Delete Entire Cycle
                    </Button>
                )}

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