'use client';

import React, { useState } from 'react';
import { WeatherReport, VerificationStatus } from '@/types/weather';
import AdminVerificationQueue from '@/components/dashboard/AdminVerificationQueue';
import {
  ShieldAlert,
  Sliders,
  Users,
  Lock,
  FileCheck,
  Check,
  RotateCcw,
} from 'lucide-react';

interface AdminPanelViewProps {
  reports: WeatherReport[];
  onSelectReport: (report: WeatherReport) => void;
  onUpdateStatus: (reportId: string, status: VerificationStatus) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'alert' | 'info') => void;
}

export default function AdminPanelView({
  reports,
  onSelectReport,
  onUpdateStatus,
  onShowToast,
}: AdminPanelViewProps) {
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState<number>(85);
  const [duplicateSimilarityThreshold, setDuplicateSimilarityThreshold] = useState<number>(75);
  const [enableCitizenUploads, setEnableCitizenUploads] = useState<boolean>(true);
  const [highRiskAutoAlert, setHighRiskAutoAlert] = useState<boolean>(true);

  const handleSaveSettings = () => {
    onShowToast(
      'System Thresholds Updated',
      'AI auto-verification & deduplication parameters saved across distributed nodes.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Panel & Operational Control
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure automated AI scoring thresholds, ingest policies, and oversee human moderation queues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Security Level: Tier-1 Govt National Operations
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Sliders & System Rules */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Sliders className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            AI Automation & Policy Thresholds
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Threshold 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Auto-Verification AI Confidence Threshold</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">
                {autoVerifyThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={98}
              value={autoVerifyThreshold}
              onChange={(e) => setAutoVerifyThreshold(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
            <p className="text-[11px] text-slate-400">
              Reports with AI confidence above this score bypass human review into the live dashboard.
            </p>
          </div>

          {/* Threshold 2 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Duplicate Elimination Semantic Threshold</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {duplicateSimilarityThreshold}%
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={95}
              value={duplicateSimilarityThreshold}
              onChange={(e) => setDuplicateSimilarityThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="text-[11px] text-slate-400">
              Cosine vector similarity score required to merge duplicate reports into clusters.
            </p>
          </div>

          {/* Toggle 1 */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Citizen Portal Public Ingestion
              </div>
              <div className="text-[11px] text-slate-400">
                Allow inbound mobile & web reports from registered citizen users
              </div>
            </div>
            <button
              onClick={() => setEnableCitizenUploads(!enableCitizenUploads)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableCitizenUploads ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableCitizenUploads ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Automatic Emergency Alert Dispatch
              </div>
              <div className="text-[11px] text-slate-400">
                Auto-generate live warning bulletin if severe flood or cloudburst &gt; 95% confidence
              </div>
            </div>
            <button
              onClick={() => setHighRiskAutoAlert(!highRiskAutoAlert)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highRiskAutoAlert ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highRiskAutoAlert ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition"
          >
            <Check className="h-4 w-4" />
            <span>Apply Parameters</span>
          </button>
        </div>
      </div>

      {/* Admin Queue Review Section */}
      <AdminVerificationQueue
        reports={reports}
        onSelectReport={onSelectReport}
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
