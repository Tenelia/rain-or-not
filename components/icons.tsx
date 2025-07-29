import React from 'react';

// Using `React.SVGProps<SVGSVGElement>` for type safety
type IconProps = React.SVGProps<SVGSVGElement>;

export const RainIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
    <path d="M16 14v6"/>
    <path d="M8 14v6"/>
    <path d="M12 16v6"/>
  </svg>
);

export const SunIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41-1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);

export const RefreshCwIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 12 6-6-6-6v12"/>
    <path d="M21 18H9a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h12v12"/>
  </svg>
);

export const LoadingIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${props.className}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export const ErrorIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
    </svg>
);

export const WindIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6"/>
        <path d="m15.5 3.5-1.42 1.42M9.92 9.92l-1.42 1.42m1.42-5.84L8.08 3.08m7.84 7.84 1.42 1.42M1 12h6m6 0h6"/>
        <path d="m3.5 8.5 1.42 1.42m7.16 7.16 1.42 1.42M3.08 15.92l1.42-1.42m7.84-7.84 1.42-1.42"/>
    </svg>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = (props) => (
  <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

export const RadarIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 0 1 9 9"/>
        <path d="M12 7a5 5 0 0 1 5 5"/>
        <path d="M12 11a1 1 0 0 1 1 1"/>
        <path d="M2.5 12.5a9.5 9.5 0 0 1 19 0"/>
        <path d="M2.5 12.5a9.5 9.5 0 0 0 19 0"/>
        <path d="M12 3v18"/>
    </svg>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

export const CompassIcon: React.FC<IconProps> = (props) => (
    <svg {...props} xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
);