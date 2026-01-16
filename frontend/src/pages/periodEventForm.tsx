import { Button, Select, Stack, Textarea } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { Controller, useForm } from "react-hook-form"
import { useCycleStore } from "../store/cycleStore"
import { createCycle } from "../services/cycleApi"

type PeriodEventValues = {
    eventType?: 'start_date' | 'hefsek_date';
    onah?: 'day' | 'night';
    notes?: string;
}

const PeriodEventForm = ({close, dateClicked} : {close: () => void; dateClicked: string}) => {
    const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
    const { register, handleSubmit, watch, control, formState: { errors : formErrors } } = useForm<PeriodEventValues>();
    const eventType = watch('eventType')
    const onSubmit = async (formData : PeriodEventValues) => {
        try {
            // TODO: Update to use new backend cycle API structure
            // The new API expects: niddahStartDate, hefsekTaharaDate, mikvahDate
            // This needs to be refactored to match the new data model

            notifications.show({
                title: 'Not Implemented',
                message: 'Cycle creation needs to be updated for new backend API',
                color: 'orange',
            })

            // Placeholder for new API call:
            // if (formData.eventType === 'start_date') {
            //     await createCycle({ niddahStartDate: dateClicked });
            // }

            triggerRefetch();
            close();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create event',
                color: 'red',
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
        <Stack align='center' justify='center' w='90%' mx='auto'>
            <Controller
                name="eventType"
                control={control}
                render={({ field }) => (
                    <Select 
                        label="Type of Event" 
                        placeholder="Select a type" 
                        required
                        data={[
                            {value: 'start_date', label: 'Period Start'},
                            {value: 'hefsek_date', label: 'Hefsek Taharah'},
                        ]} 
                        {...field}
                        value={field.value ?? null}
                        onChange={field.onChange}
                    />
                )}
            />

            <Controller
                name="onah"
                control={control}
                render={({ field }) => (
                    <Select 
                        label="Time" 
                        placeholder="Select a time"
                        required
                        disabled={eventType === 'hefsek_date' ? true : false} 
                        data={[
                            {value: 'day', label: 'Day (Before Sunset)'},
                            {value: 'night', label: 'Night (After Sunset)'},
                        ]} 
                        {...field}
                        value={field.value ?? null}
                        onChange={field.onChange}
                    />
                )}
            />
            
            <Textarea 
                label="Notes" 
                placeholder="Enter any notes" 
                disabled={eventType === 'hefsek_date' ? true : false} 
                w='100%'
                mb={10}
                {...register('notes')}
            />

            <Button
                type='submit'
                color='pink'
                fullWidth
            > Add </Button>

        </Stack>
        </form>
    )
}

export default PeriodEventForm