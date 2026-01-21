import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { Box, Group, Stack, Title, Text } from '@mantine/core';
import './calendar.css';
import CalendarEventModal from './newCalEvent.modal.tsx';
import { useState, useRef } from 'react';
import useLoadEvents from '../hooks/useLoadEvents.ts';
import EditEventModal from './editCalEvent.modal.tsx';
import { EventImpl } from '@fullcalendar/core/internal';
import { useMediaQuery } from '@mantine/hooks';
import { getHebrewMonthRange } from '../utils/hebrewDates.ts';
import { HDate } from '@hebcal/core';

export default function CalendarPage() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const events = useLoadEvents();

    const [clickedDate, setClickedDate] = useState<string>('');
    const calendarRef = useRef<any>(null);

    // New Event Modal
    const [newEventModalOpened, setNewEventModalOpened] = useState(false);
    const closeNewEventModal = () => setNewEventModalOpened(false);

    //Edit Event Modal
    const [eventModalOpened, setEventModalOpened] = useState(false);
    const closeEventModal = () => setEventModalOpened(false);
    const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);

    const handleDatesSet = () => {
        // Update title when month changes
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        const currentDate = calendarApi.getDate();
        const hebrewInfo = getHebrewMonthRange(currentDate);

        const gregorianMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const customTitle = `${gregorianMonth} / ${hebrewInfo.months} ${hebrewInfo.year}`;

        const titleElement = document.querySelector('.fc-toolbar-title');
        if (titleElement) {
            titleElement.textContent = customTitle;
        }
    };

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

    // const renderDayCell = (arg: DayCellContentArg) => {
    //     const hebrewDate = getHebrewDateString(arg.date, 'short');
    //     return (
    //         <div className="custom-day-cell">
    //             <div className="gregorian-date">{arg.dayNumberText}</div>
    //             <div className="hebrew-date">{hebrewDate}</div>
    //         </div>
    //     );
    // };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const event = eventInfo.event;
        const classNames = event.classNames;

        // Check if this is an onah event (veset-hachodesh, haflagah, onah-beinonit, or period start)
        const isOnahEvent = classNames.some(className =>
            className === 'veset-hachodesh' ||
            className === 'haflagah' ||
            className === 'onah-beinonit' ||
            className === 'onah-beinonit-kreisi' ||
            className === 'onah-beinonit-sofer' ||
            className === 'ohr-zaruah' ||
            className === 'niddah-start' ||
            className === 'period-start'
        );

        if (isOnahEvent) {
            // Determine day/night icon based on start and end dates
            const startDate = new Date(event.start!);
            const endDate = event.end ? new Date(event.end) : startDate;

            // Check if start and end are on the same Gregorian day
            const isSameDay = startDate.getFullYear() === endDate.getFullYear() &&
                             startDate.getMonth() === endDate.getMonth() &&
                             startDate.getDate() === endDate.getDate();

            const icon = isSameDay ? '☀️' : '🌙';

            // Remove emojis from title (📅, 📏, 🔄, ⏱️) but keep 🩸 for period start
            const cleanTitle = event.title.replace(/[📅📏🔄⏱️]/g, '').trim();

            return (
                <div className="fc-event-main-frame">
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">
                            {icon} {cleanTitle}
                        </div>
                    </div>
                </div>
            );
        }

        // Default rendering for other events
        return (
            <div className="fc-event-main-frame">
                {eventInfo.timeText && (
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                )}
                <div className="fc-event-title-container">
                    <div className="fc-event-title fc-sticky">
                        {eventInfo.event.title}
                    </div>
                </div>
            </div>
        );
    };

  return (
    <Stack className="calendar" w='100%' maw={1200} px={{ base: 'xs', sm: 'md' }} mx='auto' align='center' justify='center'>
        <Title order={1} mt={10} ta='center'>Mikvah Calendar</Title>
        <Text fw={500} fz={isMobile ? 'lg' : 'xl'}>Click on a day to enter a new event. Click on an existing event to edit it.</Text>
        <Text fz={isMobile ? 'sm' : 'md'}>*Do not rely on the times provided until the last minute. They are estimates.</Text>

        <FullCalendar
            ref={calendarRef}
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
            displayEventTime={true}
            eventContent={renderEventContent}
            datesSet={handleDatesSet}
            dayCellContent={(arg) => {
              const morningDate = new HDate(arg.date);

              // Get the date for the following evening by adding 1 day
              const eveningDate = new HDate(arg.date).next();

              return (
                <Box w="100%" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4px' }}>
                  <Text className="gregorian-number" style={{ flex: '0 0 auto' }}>{arg.dayNumberText}</Text>
                  <Text className="hebrew-dates" c="dimmed" fz="xs" style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    {morningDate.getDate()}-{eveningDate.getDate()} {morningDate.getMonthName()}
                  </Text>
                </Box>
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
                <Box>Veset HaChodesh</Box>
                <Box>Haflagah</Box>
                <Box>Onah Beinonit</Box>
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
