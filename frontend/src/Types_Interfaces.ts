export interface IRegister {
    _id?: string;
    email: string;
    password: string;
    ethnicity?: 'ashkenazi' | 'sephardi' | 'teimani' | 'other';
    location?: {
        city?: string;
        geonameId?: number;
        lat?: number;
        lng?: number;
        timezone?: string;
    };
    halachicPreferences?: {
        ohrZaruah?: boolean;
        kreisiUpleisi?: boolean;
        chasamSofer?: boolean;
        minimumNiddahDays?: number;
    };
    preferences: {
        email_reminders: boolean;
    };
}

export interface ICalendarEvent {
    id: string,
    title: string,
    start: string | Date,
    groupID?: string
    className?: string
    allDay?: boolean
}

export interface IPeriodData {
  id: number;
  start_date: string;
  onah: string;
  hefsek_date: string | null;
  notes: string | null;
}