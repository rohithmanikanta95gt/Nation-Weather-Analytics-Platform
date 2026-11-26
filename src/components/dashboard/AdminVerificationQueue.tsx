'use client';

import React from 'react';
import { WeatherReport, VerificationStatus } from '@/types/weather';
import {
  ShieldAlert,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Copy,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  getEventStyle,
  getVerificationBadge,
} from '@/utils/weatherUtils';

interface AdminVerificationQueueProps {
  reports: WeatherReport[];
  onSelectReport: (report: WeatherReport) => void;
  onUpdateStatus: (reportId: string, status: VerificationStatus) => void;
}

export default function AdminVerificationQueue({
  reports,
  onSelectReport,
  onUpdateStatus,
}: AdminVerificationQueueProps) {
  // Show suspicious or unverified reports
  const queueReports = reports.filter(
    (r) =>
      r.verificationStatus === 'Suspicious' ||
      r.verificationStatus === 'Unverified' ||
      r.duplicateProbability > 50
  );

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-2 ring-amber-500/20 dark:bg-amber-950 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Verification Queue
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {queueReports.length} Reports Require Moderation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Human-in-the-loop validation for AI-flagged suspicious and high-duplicate probability reports
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Admin Role: <span className="font-semibold text-slate-800 dark:text-slate-200">NDMA Intelligence Officer</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Report ID</th>
              <th className="py-2.5 px-3">Reporter & Source</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Event</th>
              <th className="py-2.5 px-3">Submitted</th>
              <th className="py-2.5 px-3">AI Confidence</th>
              <th className="py-2.5 px-3">Duplicate Prob.</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Moderator Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {queueReports.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  Verification queue is completely clear! All incoming reports triage successfully.
                </td>
              </tr>
            ) : (
              queueReports.map((report) => {
                const eventStyle = getEventStyle(report.eventType);
                const verif = getVerificationBadge(report.verificationStatus);

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* Report ID */}
                    <td className="py-3 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {report.id}
                    </td>

                    {/* Reporter & Source */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {report.source}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {report.reporterInfo}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {report.location}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.state}
                      </div>
                    </td>

                    {/* Event Category */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${eventStyle.badgeBg} ${eventStyle.badgeText} ${eventStyle.border}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: eventStyle.hex }}
                        />
                        {report.eventType}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {report.timeAgo}
                    </td>

                    {/* AI Confidence */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono font-bold ${
                          report.confidence >= 80
                            ? 'text-emerald-600'
                            : report.confidence >= 60
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {report.confidence}%
                      </span>
                    </td>

                    {/* Duplicate Probability */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            report.duplicateProbability > 60
                              ? 'text-red-500'
                              : 'text-slate-500'
                          }`}
                        >
                          {report.duplicateProbability}%
                        </span>
                        {report.duplicateOfId && (
                          <span
                            className="rounded bg-rose-50 px-1 py-0.2 text-[9px] font-mono text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            title={`Duplicate candidate of ${report.duplicateOfId}`}
                          >
                            Match
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold border ${verif.badgeBg} ${verif.badgeText} ${verif.border}`}
                      >
                        {report.verificationStatus}
                      </span>
                    </td>

                    {/* Actions: Verify, Reject, Mark Suspicious, Details */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Verify Button */}
                        <button
                          onClick={() => onUpdateStatus(report.id, 'Verified')}
                          className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 transition"
                          title="Verify Report"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>

                        {/* Mark Suspicious Button */}
                        <button
                          onClick={() => onUpdateStatus(report.id, 'Suspicious')}
                          className="rounded-lg bg-amber-50 p-1.5 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900 transition"
                          title="Flag as Suspicious"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => onUpdateStatus(report.id, 'Rejected')}
                          className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900 transition"
                          title="Reject Report"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        {/* View Details Modal */}
                        <button
                          onClick={() => onSelectReport(report)}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                          title="Open Full Detail Panel"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
