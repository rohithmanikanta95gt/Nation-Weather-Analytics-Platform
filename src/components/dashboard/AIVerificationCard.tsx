'use client';

import React from 'react';
import { AIAnalytics } from '@/types/weather';
import { formatNumber } from '@/utils/weatherUtils';
import {
  BrainCircuit,
  CopyX,
  AlertOctagon,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

interface AIVerificationCardProps {
  analytics: AIAnalytics;
  onExploreVerification?: () => void;
}

export default function AIVerificationCard({
  analytics,
  onExploreVerification,
}: AIVerificationCardProps) {
  const distribution = [
    {
      label: 'Verified',
      pct: analytics.distribution.verified,
      color: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      subtext: 'High confidence cross-validated telemetry',
    },
    {
      label: 'Suspicious',
      pct: analytics.distribution.suspicious,
      color: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      subtext: 'Anomalous timestamp or geotag conflict',
    },
    {
      label: 'Duplicate',
      pct: analytics.distribution.duplicate,
      color: 'bg-indigo-500',
      text: 'text-indigo-700 dark:text-indigo-300',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
      subtext: 'NLP semantic match within 15km cluster',
    },
    {
      label: 'Rejected',
      pct: analytics.distribution.rejected,
      color: 'bg-rose-500',
      text: 'text-rose-700 dark:text-rose-300',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      subtext: 'Failed reverse image & sensor check',
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sm shadow-sky-600/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Report Verification
              </h3>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:ring-indigo-800">
                v2.4 Active Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-modal NLP + Computer Vision trust pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-right dark:border-slate-700 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Avg AI Confidence
            </span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {analytics.avgConfidence}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI metric pills */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Cpu className="h-3.5 w-3.5 text-sky-500" />
            <span>Reports Analysed</span>
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {formatNumber(analytics.reportsAnalysed)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <CopyX className="h-3.5 w-3.5 text-indigo-500" />
            <span>Duplicates Removed</span>
          </div>
          <div className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {formatNumber(analytics.duplicatesRemoved)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <AlertOctagon className="h-3.5 w-3.5 text-amber-500" />
            <span>Suspicious Flagged</span>
          </div>
          <div className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatNumber(analytics.suspiciousDetected)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Verified Reports</span>
          </div>
          <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(analytics.verifiedCount)}
          </div>
        </div>
      </div>

      {/* Visual: AI Confidence Distribution */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            AI Confidence Distribution
          </h4>
          <span className="text-[11px] text-slate-400">
            Cross-validation across official & crowdsourced streams
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="mt-3 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${analytics.distribution.verified}%` }}
            title={`Verified: ${analytics.distribution.verified}%`}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${analytics.distribution.suspicious}%` }}
            title={`Suspicious: ${analytics.distribution.suspicious}%`}
          />
          <div
            className="bg-indigo-500 transition-all duration-500"
            style={{ width: `${analytics.distribution.duplicate}%` }}
            title={`Duplicate: ${analytics.distribution.duplicate}%`}
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{ width: `${analytics.distribution.rejected}%` }}
            title={`Rejected: ${analytics.distribution.rejected}%`}
          />
        </div>

        {/* Distribution Details Grid */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {distribution.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border border-slate-100 p-2.5 dark:border-slate-800/80 ${item.bgLight}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                </div>
                <span className={`font-mono text-xs font-extrabold ${item.text}`}>
                  {item.pct}%
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                {item.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Model explanation quote matching prompt */}
      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-950 dark:bg-sky-950/20">
        <p className="text-xs italic text-slate-600 dark:text-slate-300">
          &ldquo;AI models analyse report content, source reliability, location consistency
          and duplicate patterns to estimate report credibility.&rdquo;
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-sky-800 dark:text-sky-300 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>Architecture: Bi-Encoder BERT + MobileNetV3 + DBSCAN Geospatial Clustering</span>
          </span>
          {onExploreVerification && (
            <button
              onClick={onExploreVerification}
              className="flex items-center gap-1 hover:underline font-semibold"
            >
              <span>Verification Desk</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
