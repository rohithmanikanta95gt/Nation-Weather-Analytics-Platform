'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  HOURLY_REPORTS_DATA,
  DAILY_TRENDS_DATA,
  EVENT_DISTRIBUTION_DATA,
  STATE_REPORTS_DATA,
  VERIFICATION_ANALYTICS_DATA,
} from '@/data/mockData';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  MapPin,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface WeatherEventChartsProps {
  selectedState?: string;
  selectedEventType?: string;
}

export default function WeatherEventCharts({
  selectedState = 'All States',
  selectedEventType = 'All Events',
}: WeatherEventChartsProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'24h' | '7d'>('24h');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  // Filter or highlight state reports
  const displayStateReports =
    selectedState !== 'All States'
      ? STATE_REPORTS_DATA.map((s) => ({
          ...s,
          isHighlight: s.state.toLowerCase() === selectedState.toLowerCase(),
        }))
      : STATE_REPORTS_DATA;

  return (
    <section className="space-y-4">
      {/* 2x2 Grid of Analytical Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 1: Reports Over Time */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chart 1 — Reports Over Time
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Telemetry influx & verified reports curve
                </p>
              </div>
            </div>

            {/* Timeframe switch */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setTimeframe('24h')}
                className={`rounded-md px-2.5 py-1 transition ${
                  timeframe === '24h'
                    ? 'bg-white shadow-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Last 24 Hours
              </button>
              <button
                onClick={() => setTimeframe('7d')}
                className={`rounded-md px-2.5 py-1 transition ${
                  timeframe === '7d'
                    ? 'bg-white shadow-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                Last 7 Days
              </button>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timeframe === '24h' ? (
                <AreaChart
                  data={HOURLY_REPORTS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    name="Total Influx"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    name="Verified"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVerified)"
                  />
                </AreaChart>
              ) : (
                <AreaChart
                  data={DAILY_TRENDS_DATA}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="7-Day Reports"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDaily)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Event Distribution (Donut Chart) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <PieIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chart 2 — Event Distribution
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Breakdown by primary weather category
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              14,826 Total
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between h-64">
            <div className="h-56 w-56 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EVENT_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {EVENT_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(value: any) => [`${value} reports`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400">Rainfall</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  37.0%
                </span>
              </div>
            </div>

            {/* Custom Interactive Legend */}
            <div className="w-full sm:w-auto mt-2 sm:mt-0 space-y-1 text-xs">
              {EVENT_DISTRIBUTION_DATA.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4 py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: State-wise Reports (Horizontal Bar Chart) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chart 3 — State-wise Reports
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Top 10 weather-impacted Indian states
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Ranked by Volume
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={displayStateReports.slice(0, 7)}
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="state"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Weather Reports"
                  fill="#0284c7"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Verification Analytics */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chart 4 — Verification Analytics
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Trust triage breakdown of incoming big data
                </p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              73.9% Automated
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={VERIFICATION_ANALYTICS_DATA}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="status"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val.toLocaleString()} (${item.payload.percentage}%)`,
                    'Reports',
                  ]}
                />
                <Bar
                  dataKey="count"
                  name="Reports"
                  radius={[6, 6, 0, 0]}
                >
                  {VERIFICATION_ANALYTICS_DATA.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
