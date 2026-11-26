'use client';

import React, { useState } from 'react';
import { CityWeather } from '@/types/weather';
import {
  Building2,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Gauge,
} from 'lucide-react';

interface CityWeatherOverviewProps {
  cities: CityWeather[];
  onSelectCity?: (cityName: string) => void;
  selectedCity?: string;
}

export default function CityWeatherOverview({
  cities,
  onSelectCity,
  selectedCity,
}: CityWeatherOverviewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [search, setSearch] = useState<string>('');

  const filteredCities = cities.filter(
    (c) =>
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()) ||
      c.alert.toLowerCase().includes(search.toLowerCase())
  );

  const getAlertBadge = (alert: string, level: CityWeather['alertLevel']) => {
    switch (level) {
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 dark:bg-red-950/80 dark:text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
            {alert}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800 dark:bg-orange-950/80 dark:text-orange-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            {alert}
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            {alert}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Normal
          </span>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Real-Time Weather Overview
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Major Indian Metros & Critical Hubs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aggregated automatic weather station (AWS) telemetry and Doppler radar feeds
          </p>
        </div>

        {/* View toggle & city search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-36 sm:w-48 rounded-lg border border-slate-200 bg-slate-50/70 py-1 pl-8 pr-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`rounded-md p-1.5 transition ${
                viewMode === 'cards'
                  ? 'bg-white shadow-xs text-slate-900 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">City & State</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Rainfall</th>
                  <th className="py-2.5 px-3">Wind</th>
                  <th className="py-2.5 px-3">Humidity</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Alert Status</th>
                  <th className="py-2.5 px-3 text-right">AQI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCities.map((item) => {
                  const isSelected = selectedCity === item.city;
                  return (
                    <tr
                      key={item.city}
                      onClick={() => onSelectCity && onSelectCity(item.city)}
                      className={`cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                        isSelected
                          ? 'bg-sky-50/60 dark:bg-sky-950/40 font-semibold'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.city}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          {item.state}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.temp}°C
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-medium ${
                            item.rainfallMm > 20
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.rainfallMm} mm
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-600 dark:text-slate-300">
                          {item.windKmh} km/h
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-600 dark:text-slate-300">
                          {item.humidityPct}%
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-600 dark:text-slate-300">
                          {item.condition}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {getAlertBadge(item.alert, item.alertLevel)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            item.aqi > 150
                              ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : item.aqi > 100
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {item.aqi}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCities.map((item) => (
              <div
                key={item.city}
                onClick={() => onSelectCity && onSelectCity(item.city)}
                className={`cursor-pointer rounded-xl border p-3.5 transition hover:shadow-md ${
                  selectedCity === item.city
                    ? 'border-sky-500 bg-sky-50/30 dark:border-sky-400 dark:bg-sky-950/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.city}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {item.state}
                    </span>
                  </div>
                  {getAlertBadge(item.alert, item.alertLevel)}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {item.temp}°C
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.condition}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-center text-[10px] dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Rainfall</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {item.rainfallMm} mm
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Wind</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.windKmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Humidity</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.humidityPct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
