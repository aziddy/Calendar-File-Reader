import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type { CalendarEvent, Attendee, Organizer } from '../types';

interface EventCardProps {
  event: CalendarEvent;
  timezone: string;
}

const InfoRow: React.FC<{ icon: JSX.Element; label: string; value: string | JSX.Element; }> = ({ icon, label, value }) => (
    <div className="flex items-start py-2">
        <div className="flex-shrink-0 w-8 text-gray-500 dark:text-gray-400">{icon}</div>
        <div className="ml-3">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value}</dd>
        </div>
    </div>
);

const AttendeeChip: React.FC<{ attendee: Attendee }> = ({ attendee }) => {
    const statusColor = {
        'ACCEPTED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'DECLINED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'TENTATIVE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'NEEDS-ACTION': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }[attendee.status || 'NEEDS-ACTION'];
    
    return (
        <div title={`${attendee.status || 'NEEDS-ACTION'}`} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
           {attendee.name || attendee.email}
        </div>
    )
}

const EventCard: React.FC<EventCardProps> = ({ event, timezone }) => {
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');

  useEffect(() => {
    try {
      const formatDate = (date: Date, isAllDay: boolean) => {
        if (isAllDay) {
          // For all-day events, format in UTC to avoid the date shifting due to timezone conversion.
          return formatInTimeZone(date, 'UTC', 'MMMM d, yyyy');
        }
        return formatInTimeZone(date, timezone, 'MMMM d, yyyy, h:mm:ss a (zzzz)');
      };
      
      setFromDateTime(formatDate(event.startDate, event.isAllDay));
      setToDateTime(formatDate(event.endDate, event.isAllDay));
    } catch (e) {
      console.error("Date formatting error:", e);
      setFromDateTime("Invalid Date");
      setToDateTime("Invalid Date");
    }
  }, [event, timezone]);

  const renderAttendees = () => {
    if (!event.attendees || event.attendees.length === 0) {
      return <span className="text-gray-500 dark:text-gray-400 italic">No attendees listed.</span>;
    }
    return <div className="flex flex-wrap gap-2">{event.attendees.map(a => <AttendeeChip key={a.email} attendee={a} />)}</div>
  }

  const renderOrganizer = (organizer?: Organizer) => {
    if (!organizer) return <span className="text-gray-500 dark:text-gray-400 italic">None</span>;
    return organizer.email ? `${organizer.name} (${organizer.email})` : organizer.name;
  }

  const renderDescription = (text: string) => {
    // URL regex pattern to match http/https URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split text by URLs and create clickable links
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden my-4">
      <div className="px-6 py-4 bg-indigo-500 text-white">
        <h3 className="text-xl font-bold">{event.summary}</h3>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <dl>
          <InfoRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Date/Time"
            value={<>From: {fromDateTime}<br/>To: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{toDateTime}</>}
          />
          {event.recurrence && <InfoRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>}
            label="Reoccurring"
            value={event.recurrence}
          />}
          {event.organizer && <InfoRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
            label="Sent By"
            value={renderOrganizer(event.organizer)}
          />}
           <InfoRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            label="Attendees"
            value={renderAttendees()}
          />
          <InfoRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Info/Description"
            value={event.description ? <div className="whitespace-pre-wrap">{renderDescription(event.description)}</div> : <span className="text-gray-500 italic dark:text-gray-400">No description provided.</span>}
          />
        </dl>
      </div>
    </div>
  );
};

export default EventCard;