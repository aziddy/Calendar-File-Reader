
import React, { useState, useCallback } from 'react';

interface FileDropzoneProps {
  onFileDrop: (file: File) => void;
  isLoading: boolean;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileDrop, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  // Consolidated handler for all drag events to prevent default behavior and manage UI state.
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  // Specific handler for the drop event to process the file.
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  }, [onFileDrop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileDrop(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".ics,.vcs,.csv"
        onChange={handleChange}
        disabled={isLoading}
      />
      <label
        htmlFor="file-upload"
        className={`flex justify-center w-full h-48 px-4 transition bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none ${isDragActive ? 'border-indigo-500' : ''}`}
      >
        {/* Added pointer-events-none to prevent child elements from interfering with parent drag events */}
        <span className="flex items-center space-x-2 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium text-gray-600 dark:text-gray-300">
            Drop your .ics, .vcs, or .csv file here, or{' '}
            <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
          </span>
        </span>
      </label>
      {/* The decorative overlay no longer needs event handlers as the parent handles everything. */}
      {isDragActive && (
        <div
          className="absolute top-0 left-0 w-full h-full bg-indigo-500 bg-opacity-20 rounded-md pointer-events-none"
        ></div>
      )}
    </div>
  );
};

export default FileDropzone;
