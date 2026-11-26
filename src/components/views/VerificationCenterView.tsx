'use client';

import React from 'react';
import { WeatherReport, VerificationStatus, AIAnalytics } from '@/types/weather';
import AdminVerificationQueue from '@/components/dashboard/AdminVerificationQueue';
import AIVerificationCard from '@/components/dashboard/AIVerificationCard';
import { ShieldCheck, BrainCircuit, CheckCheck, AlertOctagon } from 'lucide-react';

interface VerificationCenterViewProps {
  reports: WeatherReport[];
  analytics: AIAnalytics;
  onSelectReport: (report: WeatherReport) => void;
  onUpdateStatus: (reportId: string, status: VerificationStatus) => void;
}

export default function VerificationCenterView({
  reports,
  analytics,
  onSelectReport,
  onUpdateStatus,
}: VerificationCenterViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI & Human-in-the-Loop Verification Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated sentiment, computer vision OCR, EXIF reverse image match, and deduplication moderation queue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending Triage</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">
                412 Flagged
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Auto Accuracy</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                91.4%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Verification Analytics Card */}
      <AIVerificationCard analytics={analytics} />

      {/* Admin Verification Queue */}
      <AdminVerificationQueue
        reports={reports}
        onSelectReport={onSelectReport}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
