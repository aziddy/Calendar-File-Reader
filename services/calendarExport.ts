import type { CalendarEvent } from '../types';
import { formatInTimeZone } from 'date-fns-tz';

export const formatDateForCalendar = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const createGoogleCalendarUrl = (event: CalendarEvent): string => {
  const startDate = formatDateForCalendar(event.startDate);
  const endDate = formatDateForCalendar(event.endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const createAppleCalendarUrl = (event: CalendarEvent): string => {
  // Generate ICS content for Apple Calendar
  const startDate = formatDateForCalendar(event.startDate);
  const endDate = formatDateForCalendar(event.endDate);
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar File Reader//EN',
    'BEGIN:VEVENT',
    `UID:${event.uid || 'event-' + Date.now()}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  return URL.createObjectURL(blob);
};

export const downloadICS = (event: CalendarEvent, filename?: string): void => {
  const url = createAppleCalendarUrl(event);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.summary.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};