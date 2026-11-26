'use client';

import React from 'react';
import { DataSourceHealth } from '@/types/weather';
import { formatNumber } from '@/utils/weatherUtils';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
  Activity,
  Server,
  Zap,
} from 'lucide-react';

interface DataSourceStatusProps {
  sources: DataSourceHealth[];
  onSyncAll: () => void;
  isSyncing: boolean;
  onSyncSingle?: (sourceId: string) => void;
}

export default function DataSourceStatus({
  sources,
  onSyncAll,
  isSyncing,
  onSyncSingle,
}: DataSourceStatusProps) {
  const getStatusBadge = (status: DataSourceHealth['status']) => {
    switch (status) {
      case 'Online':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        );
      case 'Streaming':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-950/60 dark:text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
            Streaming
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/60 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/60 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Degraded
          </span>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data Source Health
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950 dark:text-emerald-400">
                6 Ingestion Pipelines
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live status, ping latency, and telemetry ingestion rates
            </p>
          </div>
        </div>

        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`}
          />
          <span>{isSyncing ? 'Synchronizing...' : 'Sync Pipelines'}</span>
        </button>
      </div>

      {/* Source Health Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Data Source</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Last Sync</th>
              <th className="py-2.5 px-3">Reports Ingested</th>
              <th className="py-2.5 px-3">Uptime</th>
              <th className="py-2.5 px-3">Latency</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sources.map((src) => (
              <tr
                key={src.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
              >
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-slate-400" />
                    <span>{src.name}</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">
                    {src.endpoint}
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {src.type}
                  </span>
                </td>

                <td className="py-3 px-3">{getStatusBadge(src.status)}</td>

                <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                  {src.lastSync}
                </td>

                <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                  {formatNumber(src.reportsCount)}
                </td>

                <td className="py-3 px-3">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {src.uptime}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span
                    className={`font-mono text-xs ${
                      src.latencyMs < 100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : src.latencyMs < 250
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-500'
                    }`}
                  >
                    {src.latencyMs} ms
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onSyncSingle && onSyncSingle(src.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-400 transition"
                    title="Ping Ingestion Webhook"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
