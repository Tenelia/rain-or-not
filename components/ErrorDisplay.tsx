
import React from 'react';
import { ErrorIcon, RefreshIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-900/20 border border-red-500 rounded-lg animate-fade-in">
      <ErrorIcon className="w-12 h-12 text-red-400" />
      <p className="mt-4 text-lg text-red-300">An Error Occurred</p>
      <p className="mt-1 text-sm text-red-400 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 focus:outline-hidden focus:ring-3 focus:ring-red-400 focus:ring-opacity-75 transition-transform transform hover:scale-105 active:scale-95 flex items-center"
      >
        <RefreshIcon/>
        <span className="ml-2">Try Again</span>
      </button>
    </div>
  );
};
