'use client';

import React from 'react';
import WeatherEventCharts from '@/components/dashboard/WeatherEventCharts';
import AIVerificationCard from '@/components/dashboard/AIVerificationCard';
import { AIAnalytics } from '@/types/weather';
import { BarChart3, TrendingUp, Sparkles, Filter } from 'lucide-react';

interface EventAnalyticsViewProps {
  analytics: AIAnalytics;
  selectedState?: string;
  selectedEventType?: string;
}

export default function EventAnalyticsView({
  analytics,
  selectedState = 'All States',
  selectedEventType = 'All Events',
}: EventAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Meteorological Big Data Analytics & Deep Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-dimensional trend modeling, statistical correlation, and geospatial anomaly detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Model: WRF-India v4.2 + GFS Ensemble
            </span>
          </div>
        </div>
      </div>

      {/* 4 Analytical Charts */}
      <WeatherEventCharts
        selectedState={selectedState}
        selectedEventType={selectedEventType}
      />

      {/* AI Verification Section */}
      <AIVerificationCard analytics={analytics} />
    </div>
  );
}
