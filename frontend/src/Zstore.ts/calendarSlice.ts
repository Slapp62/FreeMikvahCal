import { StateCreator } from "zustand";

export interface CalendarSlice {
    dateClicked: string;
    setClickedDate: (dateClicked: string) => void;
}

export const createCalendarSlice: StateCreator<CalendarSlice> = (set) => ({
    dateClicked: '',
    setClickedDate: (dateClicked: string) => set({ dateClicked }),
});