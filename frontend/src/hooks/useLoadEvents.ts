import { useEffect } from "react";
import { useCycleStore } from "../store/cycleStore";
import { getCycles } from "../services/cycleApi";
import { ICalendarEvent } from "../Types_Interfaces.ts";

const useLoadEvents = () => {
    const refetchFlag = useCycleStore((state) => state.refetchFlag);
    const setCycles = useCycleStore((state) => state.setCycles);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await getCycles();
                // Extract just the cycles array from the response
                setCycles(response.cycles);

                // TODO: Replace with actual cycle data mapping
                // For now, returning empty array until we update the data structure
                console.log('Cycles fetched:', response.cycles);
            } catch (error) {
                console.error("Error fetching cycles:", error);
                return;
            }

            // TODO: Map cycle data to calendar events
            // The new backend uses a different data structure:
            // - Cycles have niddahStartDate, hefsekTaharaDate, mikvahDate
            // - Vest onot are nested in vestOnot object
            // - Need to create ICalendarEvent objects from this structure
        }

        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchFlag]); // Only re-run when refetchFlag changes

    // TODO: Return mapped calendar events from cycles
    // For now returning empty array to prevent errors
    return [] as ICalendarEvent[];
}

export default useLoadEvents