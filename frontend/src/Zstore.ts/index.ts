import { create } from 'zustand'
import { UserSlice, createUserSlice } from './userSlice';
import { createEventSlice, EventSlice } from './eventSlice';
import { CalendarSlice, createCalendarSlice } from './calendarSlice';

type StoreState = UserSlice & EventSlice & CalendarSlice;

export const useZStore = create<StoreState>()((...args) => ({
  ...createUserSlice(...args),
  ...createEventSlice(...args),
  ...createCalendarSlice(...args),
}));

export default useZStore