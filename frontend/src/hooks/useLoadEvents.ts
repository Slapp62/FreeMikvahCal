import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient.ts";
import useZStore from "../Zstore.ts";
import { ICalendarEvent } from "../Types_Interfaces.ts";

const useLoadEvents = () => {
    const zCalEvents = useZStore((state) => state.events);
    const setZCalEvents = useZStore((state) => state.setEvents);
    const refetchFlag = useZStore((state) => state.refetchFlag);
    

    useEffect(() => {
        const fetchEvents = async () => {
            const {data: periods, error: periodsError} = await supabase
                .from("periods")
                .select('id, start_date, onah, hefsek_date,  notes')
                .order('start_date', { ascending: false });
            if (periodsError) {
                console.error("Error fetching periods:", periodsError);
                return;
            }

            const {data: onahs, error: onahsError} = await supabase
                .from("onahs")
                .select('period_id, onah_start, onah_day_night, type, onahOz_start')
                .order('onah_start', { ascending: false });
            if (onahsError) {
                console.error("Error fetching onahs:", onahsError);
                return;
            }
            console.log('onahs', onahs);

            const periodEvents : ICalendarEvent[] = periods?.flatMap((period) => {
                const periodIcon = period.onah === 'day' ? `☀️` : '🌜';
                const onahTime = period.onah === 'day' ? `Day` : 'Night';
                const events = [
                    {
                        id: `${period.id}-start`,
                        title: `🩸 New Period - ${periodIcon} ${onahTime}`,
                        start: period.start_date,
                        groupID: period.id,
                        className: 'period-start',
                        
                    },
                ];

                if (period.hefsek_date){
                    events.push({
                        id: `${period.id}-hefsek`,
                        title: '✅ Hefsek',
                        start: period.hefsek_date,
                        groupID: period.id,
                        className: 'hefsek',
                        
                    })
                }
                return events
            })

            const onahEvents : ICalendarEvent[] = onahs.flatMap((onah) => {               
                const events = [
                    {
                        id: `${onah.period_id}-${onah.type}`,
                        title: `${onah.type}`,
                        start: onah.onah_start,
                        groupID: onah.period_id,
                    }
                ]

                if (onah.onahOz_start){
                    events.push({
                        id: `${onah.period_id}-${onah.type}-OZ`,
                        title: `${onah.type}-OZ`,
                        start: onah.onahOz_start,
                        groupID: onah.period_id,
                    })
                }
                return events
                
            })
            
            const groupedObjectEvents = onahEvents.reduce((acc, onah) => {
                const key = onah.start;
                if (!acc[key]) {
                    acc[key] = []
                }
                acc[key].push(onah)
                return acc
            }, {} as Record<string, ICalendarEvent[]>) ;

            const groupedArrayEvents = Object.entries(groupedObjectEvents).map((item) =>{
                const startTime = item[0];
                const eventsAtSameTime = item[1];

                const converted_start = new Date(startTime);
                const endTime = new Date(converted_start.getTime() + 12 * 60 * 60 * 1000).toISOString();
                console.log('start time', startTime);
                console.log('end time', endTime);
                const combinedTitle = eventsAtSameTime.map(event => event.title).join(' & ');
                const onahIcon = eventsAtSameTime[0].start.endsWith('00:00:00') ? `☀️` : '🌜';
            
                return {
                    id: `${eventsAtSameTime[0].id}-${combinedTitle}`,
                    title: `${onahIcon} ${combinedTitle}`,
                    start: startTime,
                    end: endTime,
                    groupID: eventsAtSameTime[0].id,
                    className: 'onah',
                    allDay: false
                }
            })
            
            //
            setZCalEvents([...periodEvents as ICalendarEvent[], ...groupedArrayEvents as ICalendarEvent[]]);
        }

        fetchEvents();
    }, [refetchFlag]);

    return zCalEvents
}

export default useLoadEvents