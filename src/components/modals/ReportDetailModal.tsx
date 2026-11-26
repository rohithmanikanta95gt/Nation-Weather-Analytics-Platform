'use client';

import React from 'react';
import { WeatherReport, VerificationStatus } from '@/types/weather';
import {
  getEventStyle,
  getVerificationBadge,
  getSeverityBadge,
} from '@/utils/weatherUtils';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Radio,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  BrainCircuit,
  Layers,
  Sparkles,
  Camera,
  History,
  Check,
  Share2,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: WeatherReport | null;
  onClose: () => void;
  onUpdateStatus?: (reportId: string, status: VerificationStatus) => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onUpdateStatus,
}: ReportDetailModalProps) {
  if (!report) return null;

  const eventStyle = getEventStyle(report.eventType);
  const verif = getVerificationBadge(report.verificationStatus);
  const sever = getSeverityBadge(report.severity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: eventStyle.hex }}
            >
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Detail: <span className="font-mono text-sky-600 dark:text-sky-400">{report.id}</span>
                </h3>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${verif.badgeBg} ${verif.badgeText} ${verif.border}`}
                >
                  {report.verificationStatus}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${sever.badgeBg} ${sever.badgeText} ${sever.border}`}
                >
                  {report.severity} Severity
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingested into National Weather Intelligence Data Lake
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                <span>Geographic Location</span>
              </div>
              <div className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                {report.location}, {report.district}
              </div>
              <div className="text-[11px] text-slate-500">{report.state}, India</div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>Timestamp (IST)</span>
              </div>
              <div className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                {report.timeAgo}
              </div>
              <div className="font-mono text-[10px] text-slate-400">{report.timestamp}</div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
                <span>Data Source</span>
              </div>
              <div className="mt-1 font-bold text-slate-900 dark:text-white text-sm">
                {report.source}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{report.reporterInfo}</div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                <span>Coordinates</span>
              </div>
              <div className="mt-1 font-mono font-bold text-slate-900 dark:text-white text-sm">
                {report.coordinates.lat.toFixed(4)}° N
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                {report.coordinates.lng.toFixed(4)}° E
              </div>
            </div>
          </div>

          {/* Description & Weather Telemetry */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Report Narrative & Ground Observation
            </h4>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {report.description}
            </p>

            {report.rainfallMm !== undefined && (
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Rainfall Inundation</span>
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {report.rainfallMm} mm
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Ambient Temp</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {report.temperature || 28}°C
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Wind Velocity</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {report.windSpeedKmh || 18} km/h
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* AI Multimodal Analysis & Media Attachment Simulation */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Attached Photo / Video Sensor Verification with AI Bounding Box */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-sky-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Attached Media & Satellite Verification
                  </span>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  CV Tagged
                </span>
              </div>

              {/* Simulated Computer Vision Visual Frame */}
              <div className="relative h-48 w-full rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-700">
                {/* Background visual texture */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-sky-950 to-slate-900 opacity-90" />
                
                {/* Simulated AI Object Detection Bounding Box */}
                <div className="absolute left-10 top-8 right-16 bottom-10 rounded border-2 border-emerald-400 bg-emerald-500/10 flex flex-col justify-between p-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white rounded">
                      [DETECTED: {report.eventType.toUpperCase()} 96.2%]
                    </span>
                    <span className="text-[9px] font-mono text-emerald-300">
                      Water Level: ~0.8m
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-300 bg-black/60 px-1 rounded self-start">
                    Lat: {report.coordinates.lat.toFixed(3)} | Lng: {report.coordinates.lng.toFixed(3)}
                  </div>
                </div>

                <div className="relative z-10 text-center">
                  <p className="text-xs text-white/80 font-medium">
                    Ground Image Telemetry Verified via MobileNetV3
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Metadata EXIF validated • Timestamp synchronicity matched
                  </span>
                </div>
              </div>
            </div>

            {/* AI Trust & Duplicate Analysis */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    AI Credibility & Deduplication
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {report.confidence}% Confidence
                </span>
              </div>

              {/* Confidence bars */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">NLP Semantic Consistency</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">96%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Geospatial Sensor Cross-Check</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Duplicate Probability</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {report.duplicateProbability}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        report.duplicateProbability > 50 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${report.duplicateProbability}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Duplicate Detection Result */}
              <div className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block text-[11px] mb-1">
                  Duplicate Cluster Result:
                </span>
                {report.duplicateOfId ? (
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Matched candidate with Report <span className="font-mono font-bold text-sky-600">{report.duplicateOfId}</span> ({report.duplicateProbability}% semantic & geospatial similarity).
                  </p>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Unique ground report. Corroborated by {report.nearbyReportsCount} nearby reports within a 15km radar radius.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Verification History Trail */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-slate-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Verification History Trail & Audit Log
              </h4>
            </div>

            <div className="space-y-3">
              {report.verificationHistory.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold text-[10px]">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {step.step}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {step.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {step.note}
                    </p>
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Status: <span className="font-semibold text-slate-800 dark:text-slate-200">{report.verificationStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <>
                <button
                  onClick={() => {
                    onUpdateStatus(report.id, 'Verified');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Verify Report</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(report.id, 'Suspicious');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Mark Suspicious</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(report.id, 'Rejected');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
