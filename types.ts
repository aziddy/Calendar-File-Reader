
export interface Organizer {
  name: string;
  email?: string;
}

export interface Attendee {
  name?: string;
  email: string;
  status?: string;
}

export interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  location: string;
  organizer?: Organizer;
  attendees: Attendee[];
  recurrence?: string;
}
