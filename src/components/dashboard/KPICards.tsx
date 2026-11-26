'use client';

import React from 'react';
import {
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Waves,
  Zap,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';
import { KPIData } from '@/types/weather';
import { formatNumber } from '@/utils/weatherUtils';

interface KPICardsProps {
  kpis: KPIData;
  onCardClick?: (metricKey: string) => void;
  activeFilterMetric?: string;
}

export default function KPICards({
  kpis,
  onCardClick,
  activeFilterMetric,
}: KPICardsProps) {
  const cards = [
    {
      key: 'total',
      title: 'Total Reports',
      value: formatNumber(kpis.totalReports),
      change: `+${kpis.totalChangeToday}%`,
      changeType: 'increase',
      subText: 'vs previous 24h period',
      icon: FileText,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-900',
      sparklineColor: 'stroke-sky-500',
    },
    {
      key: 'verified',
      title: 'Verified Reports',
      value: formatNumber(kpis.verifiedReports),
      change: `${kpis.verifiedPercentage}%`,
      changeType: 'neutral',
      subText: '73.9% automated & human verified',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900',
      sparklineColor: 'stroke-emerald-500',
    },
    {
      key: 'unverified',
      title: 'Unverified Reports',
      value: formatNumber(kpis.unverifiedReports),
      change: '16.9%',
      changeType: 'decrease',
      subText: 'Pending AI/Analyst review',
      icon: Clock,
      iconColor: 'text-slate-600 dark:text-slate-300',
      iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      sparklineColor: 'stroke-slate-500',
    },
    {
      key: 'alerts',
      title: 'Active Weather Alerts',
      value: formatNumber(kpis.activeAlerts),
      change: '4 Severe',
      changeType: 'alert',
      subText: 'Across 6 high-risk states',
      icon: AlertTriangle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900',
      sparklineColor: 'stroke-rose-500',
    },
    {
      key: 'flood',
      title: 'Flood Reports',
      value: formatNumber(kpis.floodReports),
      change: `+${kpis.floodSurgePercentage}%`,
      changeType: 'increase',
      subText: 'Monsoon river basin surge',
      icon: Waves,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900',
      sparklineColor: 'stroke-blue-500',
    },
    {
      key: 'extreme',
      title: 'Extreme Weather Events',
      value: formatNumber(kpis.extremeEvents),
      change: '+8 today',
      changeType: 'increase',
      subText: 'Cloudburst & thunderstorm gusts',
      icon: Zap,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900',
      sparklineColor: 'stroke-amber-500',
    },
    {
      key: 'today',
      title: 'Reports Received Today',
      value: formatNumber(kpis.reportsToday),
      change: '118/hr avg',
      changeType: 'increase',
      subText: 'Continuous ingestion live rate',
      icon: CalendarDays,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900',
      sparklineColor: 'stroke-indigo-500',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilterMetric === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onCardClick && onCardClick(card.key)}
            className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-sky-500 bg-sky-50/40 shadow-md ring-2 ring-sky-500/20 dark:border-sky-400 dark:bg-sky-950/30'
                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700'
            }`}
          >
            {/* Top row: Icon and Change badge */}
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>

              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  card.changeType === 'increase'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : card.changeType === 'alert'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {card.changeType === 'increase' && (
                  <TrendingUp className="h-3 w-3" />
                )}
                {card.changeType === 'decrease' && (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.change}
              </div>
            </div>

            {/* Middle: Number & Title */}
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {card.title}
              </div>
            </div>

            {/* Bottom: Subtext & Sparkline visual */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                {card.subText}
              </span>

              {/* Mini sparkline curve SVG */}
              <svg className="h-4 w-12 shrink-0 overflow-visible" viewBox="0 0 48 16">
                <path
                  d="M0,14 Q8,12 16,8 T32,5 T48,2"
                  fill="none"
                  className={card.sparklineColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </section>
  );
}
