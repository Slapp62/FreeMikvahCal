import { useEffect, useState } from 'react';
import { useCycleStore } from '../store/cycleStore';
import { getCycles, getCalendarEvents } from '../services/cycleApi';
import { ICalendarEvent } from '../Types_Interfaces.ts';

const useLoadEvents = () => {
  const refetchFlag = useCycleStore((state) => state.refetchFlag);
  const setCycles = useCycleStore((state) => state.setCycles);
  const [events, setEvents] = useState<ICalendarEvent[]>([]);

  // Fetch both cycles and events from API when refetchFlag changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch pre-formatted calendar events from server
        const eventsResponse = await getCalendarEvents();
        setEvents(eventsResponse.events);

        // Still fetch cycles for store (needed by forms and other components)
        const cyclesResponse = await getCycles();
        setCycles(cyclesResponse.cycles);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setCycles([]);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchFlag]);

  return events;
};

export default useLoadEvents;
