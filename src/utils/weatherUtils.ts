import {
  WeatherEventType,
  VerificationStatus,
  SeverityLevel,
} from '@/types/weather';

export interface EventStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  hex: string;
  iconName: string;
  dotBg: string;
}

export const EVENT_STYLES: Record<WeatherEventType, EventStyle> = {
  Rainfall: {
    label: 'Rainfall',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hex: '#3b82f6',
    iconName: 'CloudRain',
    dotBg: 'bg-blue-500',
  },
  Thunderstorm: {
    label: 'Thunderstorm',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hex: '#a855f7',
    iconName: 'CloudLightning',
    dotBg: 'bg-purple-500',
  },
  Flood: {
    label: 'Flood',
    badgeBg: 'bg-red-500/10 dark:bg-red-950/40',
    badgeText: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    hex: '#ef4444',
    iconName: 'Waves',
    dotBg: 'bg-red-500',
  },
  Heatwave: {
    label: 'Heatwave',
    badgeBg: 'bg-orange-500/10 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    hex: '#f97316',
    iconName: 'Sun',
    dotBg: 'bg-orange-500',
  },
  Fog: {
    label: 'Fog',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-800/60',
    badgeText: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    hex: '#94a3b8',
    iconName: 'CloudFog',
    dotBg: 'bg-slate-400',
  },
  'Dust Storm': {
    label: 'Dust Storm',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    hex: '#eab308',
    iconName: 'Wind',
    dotBg: 'bg-amber-500',
  },
  'Strong Wind': {
    label: 'Strong Wind',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    hex: '#22c55e',
    iconName: 'Wind',
    dotBg: 'bg-emerald-500',
  },
};

export function getEventStyle(eventType: WeatherEventType): EventStyle {
  return (
    EVENT_STYLES[eventType] || {
      label: eventType,
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      hex: '#64748b',
      iconName: 'AlertCircle',
      dotBg: 'bg-slate-400',
    }
  );
}

export function getVerificationBadge(status: VerificationStatus): {
  badgeBg: string;
  badgeText: string;
  border: string;
} {
  switch (status) {
    case 'Verified':
      return {
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
      };
    case 'Unverified':
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800/60',
        badgeText: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
      };
    case 'Suspicious':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
      };
    case 'Rejected':
      return {
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
        badgeText: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
      };
    default:
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
      };
  }
}

export function getSeverityBadge(severity: SeverityLevel): {
  badgeBg: string;
  badgeText: string;
  border: string;
} {
  switch (severity) {
    case 'Low':
      return {
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
        badgeText: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800',
      };
    case 'Moderate':
      return {
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
      };
    case 'High':
      return {
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
        badgeText: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
      };
    case 'Severe':
    case 'Extreme':
      return {
        badgeBg: 'bg-red-50 dark:bg-red-950/50',
        badgeText: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
      };
    default:
      return {
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
      };
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
