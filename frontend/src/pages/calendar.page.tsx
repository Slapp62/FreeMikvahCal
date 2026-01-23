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

// Helper function to abbreviate event titles on mobile
const getEventAbbreviation = (title: string, isMobile: boolean): string => {
    if (!isMobile) return title;

    // Remove all emojis first for clean matching (including 🩸 blood drop U+1FA78)
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1FA00}-\u{1FAFF}]/gu, '').trim();

    // Mobile abbreviations mapping
    const abbreviations: Record<string, string> = {
        'Period Start': 'PS',
        'Hefsek Tahara': 'Hefsek',
        'Shiva Nekiyim Start': '7N',
        'Mikvah': 'Mikvah',
        'Veset HaChodesh': 'Chodesh',
        'Haflagah': 'Haf',
        'Onah Beinonit': 'OB30',
        'Kreisi U\'Pleisi': 'OB31',
        'Beinonit 31': 'OB31',
        'Ohr Zaruah - Veset HaChodesh': 'OZ-VH',
        'Ohr Zaruah - Haflagah': 'OZ-Haf',
        'Ohr Zaruah - Onah Beinonit': 'OZ-OB',
    };

    return abbreviations[cleanTitle] || cleanTitle;
};

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

        // Format differently for mobile vs desktop
        const customTitle = isMobile
            ? `${gregorianMonth}<br/><span style="font-size: 0.85em; opacity: 0.9;">${hebrewInfo.months} ${hebrewInfo.year}</span>`
            : `${gregorianMonth} / ${hebrewInfo.months} ${hebrewInfo.year}`;

        const titleElement = document.querySelector('.fc-toolbar-title');
        if (titleElement) {
            titleElement.innerHTML = customTitle;
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

    const eventDidMount = (info: any) => {
        const event = info.event;
        const classNames = event.classNames;

        // Check if this is an onah event
        const isOnahEvent = classNames.some((className: string) =>
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
            // Determine if it's day or night onah based on start and end dates
            const startDate = new Date(event.start!);
            const endDate = event.end ? new Date(event.end) : startDate;

            // Check if start and end are on the same Gregorian day
            const isSameDay = startDate.getFullYear() === endDate.getFullYear() &&
                             startDate.getMonth() === endDate.getMonth() &&
                             startDate.getDate() === endDate.getDate();

            // Add custom class to the event element
            if (isSameDay) {
                info.el.classList.add('day-onah');
            } else {
                info.el.classList.add('night-onah');
            }
        }
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const event = eventInfo.event;
        const classNames = event.classNames;

        // Check if this is hefsek-tahara or mikvah event (show only their icon on left, no time)
        const isHefsekorMikvah = classNames.some(className =>
            className === 'hefsek-tahara' || className === 'mikvah'
        );

        if (isHefsekorMikvah) {
            // Extract the icon from the title and remove it from the text
            let icon = '';
            let cleanTitle = event.title;

            if (event.title.includes('✅')) {
                icon = '✅';
                cleanTitle = event.title.replace('✅', '').trim();
            } else if (event.title.includes('🛁')) {
                icon = '🛁';
                cleanTitle = event.title.replace('🛁', '').trim();
            }

            // Apply abbreviation on mobile
            const displayTitle = getEventAbbreviation(cleanTitle, isMobile);

            return (
                <div className="fc-event-main-frame">
                    <div className="fc-event-time">{icon}</div>
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">
                            {displayTitle}
                        </div>
                    </div>
                </div>
            );
        }

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

            // Apply abbreviation on mobile
            const displayTitle = getEventAbbreviation(cleanTitle, isMobile);

            return (
                <div className="fc-event-main-frame">
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">
                            {`${icon} ${displayTitle}`}
                        </div>
                    </div>
                </div>
            );
        }

        // Default rendering for other events
        const displayTitle = getEventAbbreviation(event.title, isMobile);

        return (
            <div className="fc-event-main-frame">
                {eventInfo.timeText && (
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                )}
                <div className="fc-event-title-container">
                    <div className="fc-event-title fc-sticky">
                        {displayTitle}
                    </div>
                </div>
            </div>
        );
    };

  return (
    <Stack className="calendar" w='100%' maw={{ base: '100%', sm: 1200 }} px={{ base: 0, sm: 'md' }} mx='auto' align='center' justify='center'>
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
            eventDidMount={eventDidMount}
            datesSet={handleDatesSet}
            dayCellContent={(arg) => {
              const morningDate = new HDate(arg.date);

              // Get the date for the following evening by adding 1 day
              const eveningDate = new HDate(arg.date).next();

              return (
                <Box
                  w="100%"
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: isMobile ? 'flex-start' : 'space-between',
                    alignItems: 'flex-start',
                    padding: '4px'
                  }}
                >
                  <Text className="gregorian-number" style={{ flex: '0 0 auto' }}>{arg.dayNumberText}</Text>
                  <Text
                    className="hebrew-dates"
                    c="dimmed"
                    style={{
                      textAlign: isMobile ? 'left' : 'right',
                      flex: '0 0 auto',
                      marginTop: isMobile ? '2px' : '0'
                    }}
                  >
                    {morningDate.getDate()}-{eveningDate.getDate()} {morningDate.getMonthName()}
                  </Text>
                </Box>
              );
            }}
        />
        <Stack gap="xs" mt={20} mb={10}>
            <Text fw={600} size="sm" ta="center">Event Types</Text>
            {isMobile ? (
                // Mobile: Show abbreviations legend
                <Group bd={'2px solid rgb(207, 207, 207)'} px={15} py={8} gap={8} justify="center" wrap="wrap">
                    <Box>PS = Period Start</Box>
                    <Box>HT = Hefsek Tahara</Box>
                    <Box>7N = Shiva Nekiyim</Box>
                    <Box>Mik = Mikvah</Box>
                    <Box>VH = Veset HaChodesh</Box>
                    <Box>Haf = Haflagah</Box>
                    <Box>OB30 = Onah Beinonit</Box>
                    <Box>OB31 = Kreisi U'Pleisi</Box>
                    <Box>OZ-VH, OZ-Haf, OZ-OB = Ohr Zaruah</Box>
                </Group>
            ) : (
                // Desktop: Keep icon legend
                <Group bd={'2px solid rgb(207, 207, 207)'} px={15} py={8} gap={20} justify="center" wrap="wrap">
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
            )}
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
