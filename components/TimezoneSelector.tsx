
import React from 'react';
import { TIMEZONES } from '../constants';

interface TimezoneSelectorProps {
  selectedTimezone: string;
  onTimezoneChange: (timezone: string) => void;
  disabled: boolean;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ selectedTimezone, onTimezoneChange, disabled }) => {
  return (
    <div>
      <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Timezone
      </label>
      <select
        id="timezone-select"
        value={selectedTimezone}
        onChange={(e) => onTimezoneChange(e.target.value)}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneSelector;
