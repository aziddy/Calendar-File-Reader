# Calendar File Reader

A client-side calendar file parser and inspector built with React, TypeScript, and Vite. Parse and view events from `.ics`, `.vcs`, and `.csv` calendar files with timezone conversion support.

## Features

- =� **Multiple Format Support**: Parse `.ics`, `.vcs` (vCalendar), and `.csv` files
- <
 **Timezone Conversion**: View events in different timezones
- = **Recurrence Rules**: Display recurring event patterns in human-readable format
- =� **Responsive Design**: Works on desktop and mobile devices
- <� **Dark Mode**: Automatic dark/light theme support
- =� **Client-Side Only**: No server required - all parsing happens in your browser

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calendar-file-reader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Upload a File**: Drag and drop or click to select a calendar file (`.ics`, `.vcs`, or `.csv`)
2. **Select Timezone**: Choose your preferred timezone from the dropdown
3. **View Events**: Browse parsed events with details like attendees, organizers, and recurrence patterns

### Supported File Formats

#### ICS/VCS Files
- Standard iCalendar format
- Supports recurring events with RRULE
- Extracts attendees, organizers, and event details

#### CSV Files
Flexible header mapping supports various column names:
- **Subject/Title** � Event title
- **Start Date/startDate** � Start time
- **End Date/endDate** � End time
- **Description** � Event description
- **Location** � Event location
- **Attendees** � Comma-separated email list

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **ical.js** - ICS/VCS parsing
- **PapaParse** - CSV parsing
- **rrule.js** - Recurrence rule processing
- **date-fns** - Date formatting and timezone conversion

## Architecture

The application follows a simple React component architecture:

- **App.tsx** - Main application state and file handling
- **components/** - Reusable UI components
- **services/** - Calendar parsing logic
- **types.ts** - TypeScript interfaces

All parsing happens client-side for privacy and performance - no data leaves your browser.

## License

This project is open source and available under the [MIT License](LICENSE).