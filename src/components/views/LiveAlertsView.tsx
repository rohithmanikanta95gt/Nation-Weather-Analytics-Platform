'use client';

import React, { useState } from 'react';
import { LiveAlert } from '@/types/weather';
import LiveAlertsPanel from '@/components/dashboard/LiveAlertsPanel';
import { AlertTriangle, PlusCircle, ShieldAlert, Radio, BellRing, Filter } from 'lucide-react';

interface LiveAlertsViewProps {
  alerts: LiveAlert[];
  onSelectAlert: (alert: LiveAlert) => void;
  onOpenBroadcastModal: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export default function LiveAlertsView({
  alerts,
  onSelectAlert,
  onOpenBroadcastModal,
  onAcknowledgeAlert,
}: LiveAlertsViewProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'All') return true;
    return a.severity.toLowerCase() === severityFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-red-200/60 bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 p-5 shadow-xs dark:border-red-900/40 dark:from-red-950/30 dark:via-slate-900 dark:to-amber-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  National Disaster Management Command & Alert Center
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  DEFCON 2 MONITORING
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Direct integration with IMD Cyclone Warnings, CWC Flood Telemetry, and State Disaster Response Forces (SDRF)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenBroadcastModal}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Broadcast Emergency Warning</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Filter by Threat Level:
          </span>
          <div className="flex gap-1.5">
            {['All', 'Severe', 'High', 'Moderate'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSeverityFilter(lvl)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  severityFilter === lvl
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredAlerts.length} Active Warnings
        </span>
      </div>

      {/* Live Alerts Panel */}
      <LiveAlertsPanel
        alerts={filteredAlerts}
        onSelectAlert={onSelectAlert}
        onBroadcastClick={onOpenBroadcastModal}
        onAcknowledgeAlert={onAcknowledgeAlert}
      />
    </div>
  );
}
