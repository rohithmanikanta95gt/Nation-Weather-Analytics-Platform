'use client';

import React from 'react';
import { DataSourceHealth } from '@/types/weather';
import DataSourceStatus from '@/components/dashboard/DataSourceStatus';
import { Radio, Server, Activity, Database, CheckCircle2 } from 'lucide-react';

interface DataSourcesViewProps {
  sources: DataSourceHealth[];
  onSyncAll: () => void;
  isSyncing: boolean;
  onSyncSingle?: (sourceId: string) => void;
}

export default function DataSourcesView({
  sources,
  onSyncAll,
  isSyncing,
  onSyncSingle,
}: DataSourcesViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Data Sources & Ingestion Telemetry Pipelines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live monitoring of IMD Doppler radar networks, OpenWeather API, NLP social media scrapers, and CWC telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Overall Ingestion Health: 99.88% Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* Data Source Status Table */}
      <DataSourceStatus
        sources={sources}
        onSyncAll={onSyncAll}
        isSyncing={isSyncing}
        onSyncSingle={onSyncSingle}
      />
    </div>
  );
}
