import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, DayCellContentArg } from '@fullcalendar/core';
import { Box, Group, Stack, Title, Text } from '@mantine/core';
import './calendar.css';
import CalendarEventModal from './newCalEvent.modal.tsx';
import { useState } from 'react';
import useLoadEvents from '../hooks/useLoadEvents.ts';
import EditEventModal from './editCalEvent.modal.tsx';
import { EventImpl } from '@fullcalendar/core/internal';
import { useMediaQuery } from '@mantine/hooks';
import { getHebrewDateString } from '../utils/hebrewDates.ts';
import { HDate } from '@hebcal/core';

export default function CalendarPage() {
    const isMobile = useMediaQuery('(max-width: 700px)');
    const events = useLoadEvents();
    const [clickedDate, setClickedDate] = useState<string>('');
    
    // New Event Modal
    const [newEventModalOpened, setNewEventModalOpened] = useState(false);
    const closeNewEventModal = () => setNewEventModalOpened(false);
    
    //Edit Event Modal
    const [eventModalOpened, setEventModalOpened] = useState(false);
    const closeEventModal = () => setEventModalOpened(false);
    const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);

    const handleDateClick = (arg: DateClickArg) => {
        const date = arg.date;
        const dateClicked = new Date(Date.UTC(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate()))
            .toISOString().split('T')[0];
        setClickedDate(dateClicked);

        setNewEventModalOpened(true);
    };

    const handleEventClick = (arg: EventClickArg) => {
       const eventClicked = arg.event;
       setSelectedEvent(eventClicked);
       setEventModalOpened(true);
    };

    const renderDayCell = (arg: DayCellContentArg) => {
        const hebrewDate = getHebrewDateString(arg.date, 'short');
        return (
            <div className="custom-day-cell">
                <div className="gregorian-date">{arg.dayNumberText}</div>
                <div className="hebrew-date">{hebrewDate}</div>
            </div>
        );
    };

  return (
    <Stack className="calendar" w={isMobile ? '100%' : '80%'} mx='auto' align='center' justify='center'>
        <Title order={1} mt={10} ta='center'>Mikvah Calendar</Title>
        <Text fw={500} fz={isMobile ? 'lg' : 'xl'}>Click on a day to enter a new event. Click on an existing event to edit it.</Text>
    
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            selectable={true}
            height='auto'
            eventDisplay='block'
            eventOrder='start'
            timeZone='local'
            displayEventTime={false}
            dayCellContent={(arg) => {
              const morningDate = new HDate(arg.date);
              
              // Get the date for the following evening by adding 1 day
              const eveningDate = new HDate(arg.date).next();

              return (
                <Group justify="space-between" align="center" w="100%" className="split-day-header">
                  <Text className="gregorian-number">{arg.dayNumberText}</Text>
                  <Stack gap={0} className="hebrew-labels-container">
                    {/* Morning Hebrew Date (e.g., 11 Shevat) */}
                    <Text className="heb-label day-label" c="dimmed" fz="xs">
                      ☀️ {morningDate.getDate()} {morningDate.getMonthName()}
                    </Text>
                    {/* Evening Hebrew Date (e.g., 12 Shevat) */}
                    <Text className="heb-label night-label" c="dimmed" fz="xs">
                      🌙 {eveningDate.getDate()} {eveningDate.getMonthName()}
                    </Text>
                  </Stack>
                </Group>
              );
            }}
        />
        <Stack gap="xs" mt={20} mb={10}>
            <Text fw={600} size="sm" ta="center">Event Types</Text>
            <Group bd={'2px solid rgb(207, 207, 207)'} px={15} py={8} gap={isMobile ? 8 : 20} justify="center" wrap="wrap">
                <Box>🩸 Period Start</Box>
                <Box>✅ Hefsek Tahara</Box>
                <Box>7️⃣ Shiva Nekiyim</Box>
                <Box>🛁 Mikvah</Box>
                <Box>📅 Veset HaChodesh</Box>
                <Box>📏 Haflagah</Box>
                <Box>🔄 Onah Beinonit</Box>
                <Box>☀️ Day Onah</Box>
                <Box>🌙 Night Onah</Box>
            </Group>
        </Stack>
        <CalendarEventModal
            clicked={newEventModalOpened}
            close={closeNewEventModal}
            dateClicked={clickedDate}
        /> 

        <EditEventModal
            clicked={eventModalOpened}
            close={closeEventModal}
            selectedEvent={selectedEvent}
        />
        
    </Stack>
  );
}
