import { Button, Select, Stack, Textarea } from "@mantine/core"
import { supabase } from "../lib/supabaseClient"
import { notifications } from "@mantine/notifications"
import { Controller, useForm } from "react-hook-form"
import useZStore from "../Zstore.ts"

type PeriodEventValues = {
    eventType?: 'start_date' | 'hefsek_date';
    onah?: 'day' | 'night';
    notes?: string;
}

const PeriodEventForm = ({close} : {close: () => void}) => {
    const refetch = useZStore((state) => state.toggleRefetchFlag);
    const dateClicked = useZStore((state) => state.dateClicked);
    const { register, handleSubmit, watch, control, formState: { errors : formErrors } } = useForm<PeriodEventValues>(); 
    const eventType = watch('eventType')
    const onSubmit = async (formData : PeriodEventValues) => {
        
        const {data, error : dbError} = await supabase.rpc('new_period_event', {
            event_type: formData.eventType,
            selected_date: dateClicked,
            ...(formData.onah && {selected_onah: formData.onah}),
            ...(formData.notes && {entered_notes: formData.notes}),
        })
        
        if (dbError?.message) {
            console.log('error adding period:', dbError.message)
            return
        };

        if (formErrors.root?.message) {
            console.log('error with form handling', formErrors.root.message);
            return
        };

        if (data[0].success) {
            notifications.show({
                title: 'Success',
                message: 'Event added successfully',
                color: 'green',
            })
            refetch();
        } else {
            notifications.show({
                title: 'Error',
                message: `${data[0].message}`,
                color: 'red',
            })
        }
        close();
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