
import React from 'react';
import { LoadingIcon } from './icons';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <LoadingIcon className="w-12 h-12 text-sky-400" />
      <p className="mt-4 text-lg text-slate-300">{message}</p>
    </div>
  );
};
