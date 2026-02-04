export interface IRegister {
    _id?: string;
    email: string;
    password: string;
    halachicCustom?: 'ashkenazi_EY' | 'ashkenazi_CL' | 'sephardi_ROY' | 'sephard_RME' | 'manual';
    location?: {
        city?: string;
        geonameId?: number;
        lat?: number;
        lng?: number;
        timezone?: string;
    };
    halachicPreferences?: {
        ohrZaruah?: boolean;
        beinonit_24hr?: boolean;
        beinonit_31?: boolean;
        vesetHachodesh30thSkip29?: boolean;
        haflagahDualMode?: 'latest_only' | 'keep_both';
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
