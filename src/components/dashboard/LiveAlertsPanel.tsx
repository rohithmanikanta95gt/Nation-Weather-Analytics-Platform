'use client';

import React from 'react';
import { LiveAlert } from '@/types/weather';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Radio,
  ExternalLink,
  ShieldAlert,
  BellRing,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { getEventStyle } from '@/utils/weatherUtils';

interface LiveAlertsPanelProps {
  alerts: LiveAlert[];
  onSelectAlert: (alert: LiveAlert) => void;
  onBroadcastClick?: () => void;
  onAcknowledgeAlert?: (alertId: string) => void;
}

export default function LiveAlertsPanel({
  alerts,
  onSelectAlert,
  onBroadcastClick,
  onAcknowledgeAlert,
}: LiveAlertsPanelProps) {
  const getSeverityBadge = (severity: LiveAlert['severity']) => {
    switch (severity) {
      case 'Severe':
        return {
          badge: 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-200 dark:border-red-800',
          dot: 'bg-red-600',
          emoji: '🔴',
          borderAccent: 'border-l-4 border-l-red-500',
        };
      case 'High':
        return {
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
          emoji: '🟠',
          borderAccent: 'border-l-4 border-l-orange-500',
        };
      case 'Moderate':
      case 'Warning':
      default:
        return {
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
          emoji: '🟡',
          borderAccent: 'border-l-4 border-l-amber-500',
        };
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-2 ring-red-500/20 dark:bg-red-950 dark:text-red-400">
            <BellRing className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Weather Alerts
              </h3>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                {alerts.length} Active Feeds
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-priority disaster warnings from IMD, CWC, and State Disaster cells
            </p>
          </div>
        </div>

        {onBroadcastClick && (
          <button
            onClick={onBroadcastClick}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Broadcast Advisory</span>
          </button>
        )}
      </div>

      {/* Alert Cards List */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert) => {
          const config = getSeverityBadge(alert.severity);
          const eventStyle = getEventStyle(alert.eventType);

          return (
            <div
              key={alert.id}
              className={`group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700 ${config.borderAccent}`}
            >
              <div>
                {/* Severity Badge & Event Type */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${config.badge}`}
                  >
                    <span>{config.emoji}</span>
                    <span>{alert.severity} Alert</span>
                  </span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${eventStyle.badgeBg} ${eventStyle.badgeText}`}
                  >
                    {alert.eventType}
                  </span>
                </div>

                {/* Title & Location */}
                <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {alert.title}
                </h4>

                <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    {alert.location}, {alert.state}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {alert.description}
                </p>

                {/* Advisory note */}
                <div className="mt-2.5 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white block text-[10px] uppercase tracking-wider mb-0.5">
                    Advisory Action:
                  </span>
                  <span className="line-clamp-2">{alert.advisoryAction}</span>
                </div>
              </div>

              {/* Footer: Source, Time & Action */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex flex-col text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-sky-500" />
                    <span className="line-clamp-1 max-w-[140px]">{alert.source}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{alert.timeAgo}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onAcknowledgeAlert && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                      title="Acknowledge Dispatch"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
