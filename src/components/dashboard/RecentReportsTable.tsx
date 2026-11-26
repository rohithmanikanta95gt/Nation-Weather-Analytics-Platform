'use client';

import React, { useState, useMemo } from 'react';
import { WeatherReport, VerificationStatus, SeverityLevel } from '@/types/weather';
import {
  getEventStyle,
  getVerificationBadge,
  getSeverityBadge,
} from '@/utils/weatherUtils';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

interface RecentReportsTableProps {
  reports: WeatherReport[];
  onSelectReport: (report: WeatherReport) => void;
  onUpdateStatus?: (reportId: string, status: VerificationStatus) => void;
}

export default function RecentReportsTable({
  reports,
  onSelectReport,
  onUpdateStatus,
}: RecentReportsTableProps) {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'timestamp' | 'confidence' | 'severity'>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Filter & Search
  const filteredReports = useMemo(() => {
    let list = [...reports];

    if (statusFilter !== 'All') {
      list = list.filter((r) => r.verificationStatus === statusFilter);
    }

    if (search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.location.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.eventType.toLowerCase().includes(q) ||
          r.source.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortField === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'confidence') {
        return sortAsc ? a.confidence - b.confidence : b.confidence - a.confidence;
      }
      if (sortField === 'severity') {
        const ranks: Record<SeverityLevel, number> = {
          Extreme: 5,
          Severe: 4,
          High: 3,
          Moderate: 2,
          Low: 1,
        };
        const rankA = ranks[a.severity] || 0;
        const rankB = ranks[b.severity] || 0;
        return sortAsc ? rankA - rankB : rankB - rankA;
      }
      return 0;
    });

    return list;
  }, [reports, search, statusFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'timestamp' | 'confidence' | 'severity') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Time,Event,Location,State,Source,Verification,Severity,Confidence\n';
    const rows = filteredReports
      .map(
        (r) =>
          `"${r.id}","${r.timeAgo}","${r.eventType}","${r.location}","${r.state}","${r.source}","${r.verificationStatus}","${r.severity}",${r.confidence}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NWAP_Weather_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Weather Reports
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {filteredReports.length} records found
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-source reports stream with automated AI triage scores
          </p>
        </div>

        {/* Search, Filter Chips & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reports..."
              className="w-40 sm:w-56 rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Verification Status Quick Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="All">All Verification</option>
            <option value="Verified">Verified Only</option>
            <option value="Unverified">Unverified Only</option>
            <option value="Suspicious">Suspicious Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Export filtered reports to CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => toggleSort('timestamp')}
              >
                <div className="flex items-center gap-1">
                  <span>Time</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3.5">Event</th>
              <th className="py-3 px-3.5">Location</th>
              <th className="py-3 px-3.5">State</th>
              <th className="py-3 px-3.5">Source</th>
              <th className="py-3 px-3.5">Verification</th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => toggleSort('severity')}
              >
                <div className="flex items-center gap-1">
                  <span>Severity</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                onClick={() => toggleSort('confidence')}
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No weather reports matched your current filters.
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const eventStyle = getEventStyle(report.eventType);
                const verif = getVerificationBadge(report.verificationStatus);
                const sever = getSeverityBadge(report.severity);

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* Time */}
                    <td className="py-3 px-3.5 font-mono text-slate-800 dark:text-slate-200">
                      {report.timeAgo}
                    </td>

                    {/* Event with colored pill */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${eventStyle.badgeBg} ${eventStyle.badgeText} ${eventStyle.border}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: eventStyle.hex }}
                        />
                        {report.eventType}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white">
                      {report.location}
                    </td>

                    {/* State */}
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                      {report.state}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {report.source}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${verif.badgeBg} ${verif.badgeText} ${verif.border}`}
                      >
                        {report.verificationStatus === 'Verified' && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {report.verificationStatus === 'Unverified' && (
                          <Clock className="h-3 w-3" />
                        )}
                        {report.verificationStatus === 'Suspicious' && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {report.verificationStatus === 'Rejected' && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {report.verificationStatus}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border ${sever.badgeBg} ${sever.badgeText} ${sever.border}`}
                      >
                        {report.severity}
                      </span>
                    </td>

                    {/* Confidence percentage bar */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              report.confidence >= 90
                                ? 'bg-emerald-500'
                                : report.confidence >= 70
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${report.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {report.confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => onSelectReport(report)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:bg-slate-700 transition"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredReports.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {Math.min(currentPage * pageSize, filteredReports.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredReports.length}
          </span>{' '}
          reports
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>

          <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
