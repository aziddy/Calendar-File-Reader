import type { CalendarEvent, Attendee, Organizer } from '../types';
import ICAL from 'ical.js';
import Papa from 'papaparse';
import { RRule } from 'rrule';

const parseIcs = (data: string): CalendarEvent[] => {
  const jcalData = ICAL.parse(data);
  const component = new ICAL.Component(jcalData);
  const vevents = component.getAllSubcomponents('vevent');
  
  return vevents.map((vevent: any) => {
    const event = new ICAL.Event(vevent);

    const startDate = event.startDate.toJSDate();
    const endDate = event.endDate.toJSDate();

    const attendees: Attendee[] = vevent.getAllProperties('attendee').map((prop: any) => {
      const email = prop.getValues()[0].replace('mailto:', '');
      const name = prop.getParameter('cn');
      const status = prop.getParameter('partstat');
      return { email, name, status: status ? status.toUpperCase() : 'NEEDS-ACTION' };
    });

    let organizer: Organizer | undefined;
    const orgProp = vevent.getFirstProperty('organizer');
    if (orgProp) {
        const email = orgProp.getValues()[0].replace('mailto:', '');
        const name = orgProp.getParameter('cn') || email.split('@')[0];
        organizer = { name, email };
    }
    
    let recurrenceRule: string | undefined;
    if (event.isRecurring()) {
        const rruleProp = vevent.getFirstProperty('rrule');
        if (rruleProp) {
            try {
                const dtstart = event.startDate.toJSDate();
                
                // Manually construct rrule.js options from ical.js's parsed data
                // to avoid string-parsing issues with non-compliant UNTIL formats.
                const recur = new ICAL.Recur(rruleProp.getValues()[0]);

                const freqMap: { [key: string]: any } = {
                    YEARLY: RRule.YEARLY, MONTHLY: RRule.MONTHLY,
                    WEEKLY: RRule.WEEKLY, DAILY: RRule.DAILY,
                    HOURLY: RRule.HOURLY, MINUTELY: RRule.MINUTELY,
                    SECONDLY: RRule.SECONDLY,
                };
                
                const weekdayMap: { [key: string]: any } = {
                    SU: RRule.SU, MO: RRule.MO, TU: RRule.TU,
                    WE: RRule.WE, TH: RRule.TH, FR: RRule.FR,
                    SA: RRule.SA,
                };

                const options: any = {
                    dtstart: dtstart,
                    freq: freqMap[recur.freq],
                };

                if (recur.until) options.until = recur.until.toJSDate();
                if (recur.count) options.count = recur.count;
                if (recur.interval) options.interval = recur.interval;
                if (recur.wkst) options.wkst = weekdayMap[recur.wkst];
                
                // rrule.js options are mostly compatible with ical.js Recur properties
                if (recur.byday) options.byday = recur.byday;
                if (recur.bymonth) options.bymonth = recur.bymonth;
                if (recur.bymonthday) options.bymonthday = recur.bymonthday;
                if (recur.byyearday) options.byyearday = recur.byyearday;
                if (recur.byweekno) options.byweekno = recur.byweekno;
                if (recur.byhour) options.byhour = recur.byhour;
                if (recur.byminute) options.byminute = recur.byminute;
                if (recur.bysecond) options.bysecond = recur.bysecond;
                if (recur.bysetpos) options.bysetpos = recur.bysetpos;

                const rule = new RRule(options);
                recurrenceRule = rule.toText();
            } catch (e) {
                console.error("Could not parse rrule:", e);
                // Fallback to the raw string representation if object construction fails
                recurrenceRule = rruleProp.toString().replace(/^RRULE:/, '');
            }
        }
    }

    const isAllDay = event.startDate.isDate;
    
    return {
      uid: event.uid,
      summary: event.summary || 'No Title',
      description: event.description || '',
      startDate,
      endDate,
      isAllDay,
      location: event.location || '',
      organizer,
      attendees,
      recurrence: recurrenceRule,
    };
  });
};

const parseCsv = (data: string): CalendarEvent[] => {
    const results = Papa.parse(data, { header: true });
    if (results.errors.length > 0) {
        console.error('CSV Parsing errors:', results.errors);
        throw new Error('Failed to parse CSV file. Check console for details.');
    }

    return results.data.map((row: any, index: number) => {
        // Common header variations
        const summary = row.Subject || row.subject || row.Title || row.title || 'Untitled Event';
        const start = row['Start Date'] || row.startDate || row.start;
        const end = row['End Date'] || row.endDate || row.end;
        const description = row.Description || row.description || '';
        const location = row.Location || row.location || '';
        const attendeesStr = row.Attendees || row.attendees || '';

        if (!start || !end) {
            throw new Error(`Row ${index + 2} is missing Start or End date.`);
        }

        const attendees: Attendee[] = attendeesStr.split(',').map((email: string) => ({
            email: email.trim(),
            status: 'NEEDS-ACTION',
        })).filter((a: Attendee) => a.email);

        return {
            uid: `csv-${Date.now()}-${index}`,
            summary,
            description,
            startDate: new Date(start),
            endDate: new Date(end),
            isAllDay: false, // CSV doesn't typically specify this
            location,
            attendees,
        };
    });
};

export const parseCalendarFile = async (file: File): Promise<CalendarEvent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
            reject(new Error("File is empty."));
            return;
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        switch (fileExtension) {
          case 'ics':
          case 'vcs':
            resolve(parseIcs(content));
            break;
          case 'csv':
            resolve(parseCsv(content));
            break;
          default:
            reject(new Error('Unsupported file type. Please use .ics, .vcs, or .csv'));
        }
      } catch (error: any) {
        reject(new Error(`Parsing failed: ${error.message}`));
      }
    };
    reader.onerror = (error) => reject(new Error(`File could not be read: ${error}`));
    reader.readAsText(file);
  });
};