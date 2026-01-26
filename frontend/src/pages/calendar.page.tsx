import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { Box, Group, Stack, Title, Text, Tooltip, Button, Divider, Popover } from '@mantine/core';
import './calendar.css';
import CalendarEventModal from './newCalEvent.modal.tsx';
import { useState, useRef } from 'react';
import useLoadEvents from '../hooks/useLoadEvents.ts';
import EditEventModal from './editCalEvent.modal.tsx';
import { EventImpl } from '@fullcalendar/core/internal';
import { useMediaQuery } from '@mantine/hooks';
import { getHebrewMonthRange } from '../utils/hebrewDates.ts';
import { HDate, Location, Zmanim } from '@hebcal/core';
import { useUserStore } from '../store/userStore.ts';

// Event type to tooltip text mapping for desktop hover tooltips
const EVENT_TOOLTIPS: Record<string, string> = {
    'niddah-start': 'Period Start - Beginning of niddah status',
    'period-start': 'Period Start - Beginning of niddah status',
    'hefsek-tahara': 'Hefsek Tahara - Internal examination to check for clean status',
    'shiva-nekiyim': 'Shiva Nekiyim - Seven clean days of purity',
    'mikvah': 'Mikvah - Ritual immersion completing the purification process',
    'veset-hachodesh': 'Veset HaChodesh - Monthly separation period based on Hebrew date',
    'haflagah': 'Haflagah - Interval-based separation period based on cycle length',
    'onah-beinonit': 'Onah Beinonit - Standard 30-day separation period',
    'onah-beinonit-kreisi': 'Onah Beinonit (Kreisi) - 31-day variant for longer cycles',
    'onah-beinonit-sofer': 'Onah Beinonit (Sofer) - Alternative calculation method',
    'ohr-zaruah': 'Ohr Zaruah - Additional stringency period (day before main veset)',
    'bedikah-clean': 'Bedikah - Internal examination with clean result',
    'bedikah-questionable': 'Bedikah - Questionable result, consult rabbinical authority',
    'bedikah-not-clean': 'Bedikah - Not clean result, voids current period',
    'bedikah-not_clean': 'Bedikah - Not clean result, voids current period',
};

// Helper function to get tooltip text from event class names
const getTooltipText = (classNames: string[]): string => {
    for (const className of classNames) {
        if (EVENT_TOOLTIPS[className]) {
            return EVENT_TOOLTIPS[className];
        }
    }
    return 'Calendar event - click for details';
};

// Helper function to format time for tooltips
const formatTime = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

// Helper function to calculate sunset and tzeit hakochavim
const calculateMikvahTimes = (date: Date, userLocation: any): { sunset: string; tzeit: string } | null => {
    if (!userLocation?.lat || !userLocation?.lng || !userLocation?.timezone) {
        return null;
    }

    try {
        const loc = new Location(
            userLocation.lat,
            userLocation.lng,
            false,
            userLocation.timezone
        );
        const zmanim = new Zmanim(loc, date, false);

        const sunset = zmanim.sunset();
        const tzeit = zmanim.tzeit();

        const formatZman = (d: Date) => d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: userLocation.timezone
        });

        return {
            sunset: formatZman(sunset),
            tzeit: formatZman(tzeit)
        };
    } catch (error) {
        console.error('Error calculating zmanim:', error);
        return null;
    }
};

// Helper function to abbreviate event titles on mobile
const getEventAbbreviation = (title: string, isMobile: boolean): string => {
    if (!isMobile) return title;

    // Remove all emojis first for clean matching (including 🩸 blood drop U+1FA78)
    const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1FA00}-\u{1FAFF}]/gu, '').trim();

    // Mobile abbreviations mapping
    const abbreviations: Record<string, string> = {
        'Period Start': 'Start',
        'Hefsek Tahara': 'Hefsek',
        'Shiva Nekiyim Start': '7N',
        'Mikvah': 'Mikvah',
        'Veset HaChodesh': 'Chodesh',
        'Haflagah': 'Haf',
        'Onah Beinonit': 'OB-30',
        'Kreisi U\'Pleisi': 'OB-31',
        'Beinonit 31': 'OB-31',
        'Ohr Zaruah - Veset HaChodesh': 'OZ-VH',
        'Ohr Zaruah - Haflagah': 'OZ-Haf',
        'Ohr Zaruah - Onah Beinonit': 'OZ-OB',
        'Bedikah - Clean': 'B-C',
        'Bedikah - Questionable': 'B-Q',
        'Bedikah - Not Clean': 'B-NC',
    };

    return abbreviations[cleanTitle] || cleanTitle;
};

export default function CalendarPage() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const events = useLoadEvents();
    const user = useUserStore((state) => state.user);

    const [clickedDate, setClickedDate] = useState<string>('');
    const calendarRef = useRef<any>(null);

    // New Event Modal
    const [newEventModalOpened, setNewEventModalOpened] = useState(false);
    const closeNewEventModal = () => setNewEventModalOpened(false);

    //Edit Event Modal
    const [eventModalOpened, setEventModalOpened] = useState(false);
    const closeEventModal = () => setEventModalOpened(false);
    const [selectedEvent, setSelectedEvent] = useState<EventImpl | null>(null);
    const [selectedEventTooltip, setSelectedEventTooltip] = useState<string>('');

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
       // On mobile, don't open modal immediately - let the Popover handle it
       if (isMobile) {
           arg.jsEvent.preventDefault();
           arg.jsEvent.stopPropagation();
           return;
       }

       // On desktop, open modal on click
       const eventClicked = arg.event;
       const tooltipText = getTooltipText(eventClicked.classNames);

       setSelectedEvent(eventClicked);
       setSelectedEventTooltip(tooltipText);
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
            const isHefsek = event.title.includes('✅');
            const isMikvahEvent = event.title.includes('🛁');

            if (isHefsek) {
                icon = '✅';
                cleanTitle = event.title.replace('✅', '').trim();
            } else if (isMikvahEvent) {
                icon = '🛁';
                cleanTitle = event.title.replace('🛁', '').trim();
            }

            // Apply abbreviation on mobile
            const displayTitle = getEventAbbreviation(cleanTitle, isMobile);

            // Get tooltip description
            const tooltipText = getTooltipText(classNames);

            // Format time for tooltip
            const eventTime = event.start ? formatTime(new Date(event.start)) : 'N/A';

            const eventContent = (
                <div className="fc-event-main-frame">
                    <div className="fc-event-time">{icon}</div>
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">
                            {displayTitle}
                        </div>
                    </div>
                </div>
            );

            // Calculate zmanim for mikvah events
            const mikvahTimes = isMikvahEvent && event.start ? calculateMikvahTimes(new Date(event.start), user?.location) : null;

            // Use Popover for mobile (interactive), Tooltip for desktop (hover)
            if (isMobile) {
                return (
                    <Popover width={250} position="top" withArrow shadow="md" clickOutsideEvents={['mousedown', 'touchstart']}>
                        <Popover.Target>
                            <div style={{ width: '100%', height: '100%' }}>
                                {eventContent}
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Stack gap="xs">
                                <Text size="sm" fw={600}>{cleanTitle}</Text>
                                <Text size="xs">{tooltipText}</Text>
                                {!isMikvahEvent && <Text size="xs" c="dimmed">Time: {eventTime}</Text>}
                                {isMikvahEvent && mikvahTimes && (
                                    <>
                                        <Text size="xs" c="dimmed">Sunset: {mikvahTimes.sunset}</Text>
                                        <Text size="xs" c="dimmed">Tzeit Hakochavim: {mikvahTimes.tzeit}</Text>
                                    </>
                                )}
                                {isHefsek && <Text size="xs" c="dimmed">Mikvah scheduled 7 days after this</Text>}
                                <Divider />
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="pink"
                                    fullWidth
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEvent(event);
                                        setSelectedEventTooltip(tooltipText);
                                        setEventModalOpened(true);
                                    }}
                                >
                                    More Info
                                </Button>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                );
            }

            // Desktop: Use Tooltip
            return (
                <Tooltip
                    label={
                        <div style={{ maxWidth: 250 }}>
                            <Text size="sm" fw={600} mb={4}>{cleanTitle}</Text>
                            <Text size="xs" mb={8}>{tooltipText}</Text>
                            {!isMikvahEvent && <Text size="xs" c="dimmed" mb={2}>Time: {eventTime}</Text>}
                            {isMikvahEvent && mikvahTimes && (
                                <>
                                    <Text size="xs" c="dimmed" mb={2}>Sunset: {mikvahTimes.sunset}</Text>
                                    <Text size="xs" c="dimmed" mb={2}>Tzeit Hakochavim: {mikvahTimes.tzeit}</Text>
                                </>
                            )}
                            {isHefsek && <Text size="xs" c="dimmed" mb={6}>Mikvah scheduled 7 days after this</Text>}
                            <Divider my={6} />
                            <Text size="xs" c="blue.4" style={{ fontStyle: 'italic', textAlign: 'center' }}>
                                Click event for full details
                            </Text>
                        </div>
                    }
                    position="top"
                    withArrow
                    multiline
                    w={250}
                    events={{ hover: true, focus: false, touch: false }}
                >
                    <div style={{ width: '100%', height: '100%' }}>
                        {eventContent}
                    </div>
                </Tooltip>
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
            const onahType = isSameDay ? 'Day Onah' : 'Night Onah';

            // Remove emojis from title (📅, 📏, 🔄, ⏱️) but keep 🩸 for period start
            const cleanTitle = event.title.replace(/[📅📏🔄⏱️]/g, '').trim();

            // Apply abbreviation on mobile
            const displayTitle = getEventAbbreviation(cleanTitle, isMobile);

            // Get tooltip description
            const tooltipText = getTooltipText(classNames);

            // Format times for tooltip
            const startTime = formatTime(startDate);
            const endTime = formatTime(endDate);

            const eventContent = (
                <div className="fc-event-main-frame">
                    <div className="fc-event-title-container">
                        <div className="fc-event-title fc-sticky">
                            {`${icon} ${displayTitle}`}
                        </div>
                    </div>
                </div>
            );

            // Use Popover for mobile (interactive), Tooltip for desktop (hover)
            if (isMobile) {
                return (
                    <Popover width={250} position="top" withArrow shadow="md" clickOutsideEvents={['mousedown', 'touchstart']}>
                        <Popover.Target>
                            <div style={{ width: '100%', height: '100%' }}>
                                {eventContent}
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Stack gap="xs">
                                <Text size="sm" fw={600}>{cleanTitle}</Text>
                                <Text size="xs">{tooltipText}</Text>
                                <Text size="xs" c="dimmed">Type: {onahType}</Text>
                                <Text size="xs" c="dimmed">Start: {startTime}</Text>
                                <Text size="xs" c="dimmed">End: {endTime}</Text>
                                <Divider />
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="pink"
                                    fullWidth
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEvent(event);
                                        setSelectedEventTooltip(tooltipText);
                                        setEventModalOpened(true);
                                    }}
                                >
                                    More Info
                                </Button>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                );
            }

            // Desktop: Use Tooltip
            return (
                <Tooltip
                    label={
                        <div style={{ maxWidth: 250 }}>
                            <Text size="sm" fw={600} mb={4}>{cleanTitle}</Text>
                            <Text size="xs" mb={8}>{tooltipText}</Text>
                            <Text size="xs" c="dimmed" mb={2}>Type: {onahType}</Text>
                            <Text size="xs" c="dimmed" mb={2}>Start: {startTime}</Text>
                            <Text size="xs" c="dimmed" mb={6}>End: {endTime}</Text>
                            <Divider my={6} />
                            <Text size="xs" c="blue.4" style={{ fontStyle: 'italic', textAlign: 'center' }}>
                                Click event for full details
                            </Text>
                        </div>
                    }
                    position="top"
                    withArrow
                    multiline
                    w={250}
                    events={{ hover: true, focus: false, touch: false }}
                >
                    <div style={{ width: '100%', height: '100%' }}>
                        {eventContent}
                    </div>
                </Tooltip>
            );
        }

        // Default rendering for other events
        const displayTitle = getEventAbbreviation(event.title, isMobile);

        // Check if this is Shiva Nekiyim event for special tooltip
        const isShivaNekiyim = classNames.some(className => className === 'shiva-nekiyim');

        const eventContent = (
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

        // Add tooltip for Shiva Nekiyim events
        if (isShivaNekiyim) {
            const tooltipText = getTooltipText(classNames);
            const startDate = event.start ? new Date(event.start) : null;
            const startTime = startDate ? formatTime(startDate) : 'N/A';
            const endDate = startDate ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
            const endDateStr = endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

            // Use Popover for mobile (interactive), Tooltip for desktop (hover)
            if (isMobile) {
                return (
                    <Popover width={250} position="top" withArrow shadow="md" clickOutsideEvents={['mousedown', 'touchstart']}>
                        <Popover.Target>
                            <div style={{ width: '100%', height: '100%' }}>
                                {eventContent}
                            </div>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Stack gap="xs">
                                <Text size="sm" fw={600}>Shiva Nekiyim Start</Text>
                                <Text size="xs">{tooltipText}</Text>
                                <Text size="xs" c="dimmed">Start: {startTime}</Text>
                                <Text size="xs" c="dimmed">Ends: {endDateStr} (7 days)</Text>
                                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                    Perform bedikah examinations twice daily (morning & evening)
                                </Text>
                                <Divider />
                                <Button
                                    size="xs"
                                    variant="light"
                                    color="pink"
                                    fullWidth
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEvent(event);
                                        setSelectedEventTooltip(tooltipText);
                                        setEventModalOpened(true);
                                    }}
                                >
                                    More Info
                                </Button>
                            </Stack>
                        </Popover.Dropdown>
                    </Popover>
                );
            }

            // Desktop: Use Tooltip
            return (
                <Tooltip
                    label={
                        <div style={{ maxWidth: 250 }}>
                            <Text size="sm" fw={600} mb={4}>Shiva Nekiyim Start</Text>
                            <Text size="xs" mb={8}>{tooltipText}</Text>
                            <Text size="xs" c="dimmed" mb={2}>Start: {startTime}</Text>
                            <Text size="xs" c="dimmed" mb={2}>Ends: {endDateStr} (7 days)</Text>
                            <Text size="xs" c="dimmed" mt={4} mb={6} style={{ fontStyle: 'italic' }}>
                                Perform bedikah examinations twice daily (morning & evening)
                            </Text>
                            <Divider my={6} />
                            <Text size="xs" c="blue.4" style={{ fontStyle: 'italic', textAlign: 'center' }}>
                                Click event for full details
                            </Text>
                        </div>
                    }
                    position="top"
                    withArrow
                    multiline
                    w={250}
                    events={{ hover: true, focus: false, touch: false }}
                >
                    <div style={{ width: '100%', height: '100%' }}>
                        {eventContent}
                    </div>
                </Tooltip>
            );
        }

        return eventContent;
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
                    padding: isMobile ? '0.5px' : '4px'
                  }}
                >
                  <Text className="gregorian-number" style={{ flex: '0 0 auto' }}>{arg.dayNumberText}</Text>
                  <Text
                    className="hebrew-dates"
                    c="dimmed"
                    style={{
                      textAlign: isMobile ? 'left' : 'right',
                      flex: '0 0 auto',
                      marginTop: isMobile ? '0.5px' : '0'
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
                    <Box>B-C = Bedikah Clean</Box>
                    <Box>B-Q = Bedikah Questionable</Box>
                    <Box>B-NC = Bedikah Not Clean</Box>
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
            tooltipText={selectedEventTooltip}
        />
        
    </Stack>
  );
}
