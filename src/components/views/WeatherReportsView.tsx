'use client';

import React from 'react';
import { WeatherReport, VerificationStatus, FilterState } from '@/types/weather';
import RecentReportsTable from '@/components/dashboard/RecentReportsTable';
import FilterPanel from '@/components/dashboard/FilterPanel';
import { FileText, Download, ShieldCheck, Filter } from 'lucide-react';

interface WeatherReportsViewProps {
  reports: WeatherReport[];
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  onSelectReport: (report: WeatherReport) => void;
  onUpdateStatus: (reportId: string, status: VerificationStatus) => void;
}

export default function WeatherReportsView({
  reports,
  filterState,
  onFilterChange,
  onResetFilters,
  onSelectReport,
  onUpdateStatus,
}: WeatherReportsViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                National Weather Big Data Ingestion Lake
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Centralized registry of verified & crowdsourced incident reports across all 28 states & 8 UTs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ingested</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {reports.length} Reports
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Rate</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                73.9%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <FilterPanel
        filterState={filterState}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalFilteredCount={reports.length}
      />

      {/* Full Reports Table */}
      <RecentReportsTable
        reports={reports}
        onSelectReport={onSelectReport}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
