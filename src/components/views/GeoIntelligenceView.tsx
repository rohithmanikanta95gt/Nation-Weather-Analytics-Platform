'use client';

import React from 'react';
import { WeatherReport, LiveAlert, CityWeather } from '@/types/weather';
import IndiaWeatherMap from '@/components/dashboard/IndiaWeatherMap';
import CityWeatherOverview from '@/components/dashboard/CityWeatherOverview';
import { MapPin, Globe, Compass, Radio } from 'lucide-react';

interface GeoIntelligenceViewProps {
  reports: WeatherReport[];
  alerts: LiveAlert[];
  cities: CityWeather[];
  onSelectReport: (report: WeatherReport) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export default function GeoIntelligenceView({
  reports,
  alerts,
  cities,
  onSelectReport,
  selectedCity,
  onSelectCity,
}: GeoIntelligenceViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-850">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Geospatial Weather & Disaster Intelligence Command
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live interactive coordinate tracking, Doppler radar sweeps, and inundation vulnerability polygon overlays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>ISRO INSAT-3DR Geostationary Ingestion: Synced</span>
            </span>
          </div>
        </div>
      </div>

      {/* Large India Weather Map */}
      <IndiaWeatherMap
        reports={reports}
        alerts={alerts}
        onSelectReport={onSelectReport}
      />

      {/* Real-Time City Weather Overview */}
      <CityWeatherOverview
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    </div>
  );
}
