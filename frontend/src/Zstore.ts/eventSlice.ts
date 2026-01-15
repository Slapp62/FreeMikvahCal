import { StateCreator } from "zustand";
import { ICalendarEvent } from "../Types_Interfaces";

export interface EventSlice {
    events: ICalendarEvent[],
    setEvents: (events: ICalendarEvent[]) => void
    addEvent: (event: ICalendarEvent) => void
    removeEvent: (event: ICalendarEvent) => void
    clearEvents: () => void
    refetchFlag: boolean
    toggleRefetchFlag: () => void
}

export const createEventSlice: StateCreator<EventSlice> = (set) => ({
    events: [],
    setEvents: (events) => set({ events }),
    addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
    removeEvent: (event) => set((state) => ({ events: state.events.filter((prevEvents) => prevEvents.id !== event.id)})),
    clearEvents: () => set({events : []}),
    refetchFlag: false,
    toggleRefetchFlag: () => set((state) => ({ refetchFlag: !state.refetchFlag })),
});

