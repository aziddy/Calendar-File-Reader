
import React, { useState, useCallback, useRef } from 'react';
import FileDropzone from './components/FileDropzone';
import TimezoneSelector from './components/TimezoneSelector';
import EventCard from './components/EventCard';
import type { CalendarEvent } from './types';
import { parseCalendarFile } from './services/calendarParser';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/New_York');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  const handleFileDrop = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setEvents([]);
    setFileName(null);
    try {
      const parsedEvents = await parseCalendarFile(file);
      setEvents(parsedEvents);
      setFileName(file.name);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during parsing.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileDrop(file);
    }
  }, [handleFileDrop]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Parsing your calendar file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }
    
    if (events.length > 0 && fileName) {
       return (
        <div>
           <div className="pb-4 mb-4 border-b border-gray-300 dark:border-gray-600">
               <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Events from <span className="text-indigo-600 dark:text-indigo-400">{fileName}</span></h2>
               <p className="text-gray-600 dark:text-gray-400">Found {events.length} event{events.length > 1 ? 's' : ''}.</p>
           </div>
           {events.map((event) => (
                <EventCard key={event.uid} event={event} timezone={selectedTimezone} />
           ))}
        </div>
       );
    }

    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Welcome to the Calendar Reader</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Drop a file above to get started.</p>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 relative ${isDragOver ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl border-4 border-dashed border-blue-500">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">Drop your calendar file here</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Supports .ics, .vcs, and .csv files</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Calendar File Inspector
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Instantly parse and view events from your .ics, .vcs, and .csv calendar files.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <FileDropzone onFileDrop={handleFileDrop} isLoading={isLoading} />
            </div>
            <div>
              <TimezoneSelector
                selectedTimezone={selectedTimezone}
                onTimezoneChange={setSelectedTimezone}
                disabled={isLoading || events.length === 0}
              />
            </div>
          </div>
          
          <div className="mt-6">
            {renderContent()}
          </div>
        </main>

         <footer className="text-center mt-12 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with React, TypeScript, and Tailwind CSS.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
