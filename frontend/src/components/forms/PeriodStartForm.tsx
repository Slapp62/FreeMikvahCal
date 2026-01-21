import { Button, Stack, Textarea, Radio, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Location, Zmanim } from '@hebcal/core';
import { useCycleStore } from '../../store/cycleStore';
import { useUserStore } from '../../store/userStore';
import { createCycle } from '../../services/cycleApi';

type PeriodStartValues = {
  onah: 'day' | 'night';
  notes?: string;
};

type Props = {
  close: () => void;
  dateClicked: string;
};

const PeriodStartForm = ({ close, dateClicked }: Props) => {
  const addCycle = useCycleStore((state) => state.addCycle);
  const triggerRefetch = useCycleStore((state) => state.triggerRefetch);
  const user = useUserStore((state) => state.user);

  const [timeRangeInfo, setTimeRangeInfo] = useState<string>('');

  const { register, handleSubmit, control, watch } = useForm<PeriodStartValues>({
    defaultValues: {
      onah: 'day',
      notes: '',
    },
  });

  const selectedOnah = watch('onah');

  // Calculate and display time range when onah changes
  useEffect(() => {
    if (!user?.location?.lat || !user?.location?.lng || !user?.location?.timezone) {
      setTimeRangeInfo('Location required for time calculations');
      return;
    }

    try {
      const date = new Date(dateClicked);
      const loc = new Location(user.location.lat, user.location.lng, false, user.location.timezone);
      const zmanim = new Zmanim(loc, date, false);
      const sunrise = zmanim.sunrise();
      const sunset = zmanim.sunset();

      let start, end;
      if (selectedOnah === 'day') {
        start = sunrise;
        end = sunset;
      } else {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayZmanim = new Zmanim(loc, nextDay, false);
        start = sunset;
        end = nextDayZmanim.sunrise();
      }

      const formatTime = (d: Date) =>
        d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: user.location?.timezone,
        });

      setTimeRangeInfo(`This onah occurs between ${formatTime(start)} and ${formatTime(end)}`);
    } catch (error) {
      console.error('Error calculating time range:', error);
      setTimeRangeInfo('Error calculating times');
    }
  }, [selectedOnah, dateClicked, user?.location]);

  const onSubmit = async (formData: PeriodStartValues) => {
    if (!user?.location?.lat || !user?.location?.lng || !user?.location?.timezone) {
      notifications.show({
        title: 'Error',
        message: 'Complete location required. Please update your profile in Settings.',
        color: 'red',
      });
      return;
    }

    try {
      // Calculate actual sunrise/sunset times using Hebcal
      const date = new Date(dateClicked);
      const loc = new Location(user.location.lat, user.location.lng, false, user.location.timezone);
      const zmanim = new Zmanim(loc, date, false);
      const sunrise = zmanim.sunrise();
      const sunset = zmanim.sunset();

      let startTime, endTime;
      if (formData.onah === 'day') {
        startTime = sunrise;
        endTime = sunset;
      } else {
        // Night onah: sunset to next sunrise
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayZmanim = new Zmanim(loc, nextDay, false);
        startTime = sunset;
        endTime = nextDayZmanim.sunrise();
      }

      const result = await createCycle({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
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
      <Stack align="center" justify="center" w="90%" mx="auto" gap="md">
        <Controller
          name="onah"
          control={control}
          render={({ field }) => (
            <Radio.Group
              label="Time of Day"
              description="Did the period start before or after sunset?"
              required
              {...field}
              w="100%"
            >
              <Group mt="xs">
                <Radio value="day" label="Before Sunset (Day)" />
                <Radio value="night" label="After Sunset (Night)" />
              </Group>
            </Radio.Group>
          )}
        />

        {timeRangeInfo && (
          <Text size="sm" c="dimmed" w="100%">
            ℹ️ {timeRangeInfo}
          </Text>
        )}

        <Textarea
          label="Notes (Optional)"
          placeholder="Enter any notes"
          w="100%"
          mb={10}
          {...register('notes')}
        />

        <Button type="submit" fullWidth>
          Add Period Start
        </Button>
      </Stack>
    </form>
  );
};

export default PeriodStartForm;
