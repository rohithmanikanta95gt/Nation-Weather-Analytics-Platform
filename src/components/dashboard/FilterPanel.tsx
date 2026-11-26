'use client';

import React, { useState } from 'react';
import { FilterState } from '@/types/weather';
import { INDIAN_STATES } from '@/data/mockData';
import {
  Filter,
  RotateCcw,
  Check,
  Calendar,
  MapPin,
  Cloud,
  ShieldCheck,
  Radio,
  ChevronDown,
  X,
} from 'lucide-react';

interface FilterPanelProps {
  filterState: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export default function FilterPanel({
  filterState,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>({ ...filterState });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const dateOptions = [
    'Today',
    'Last 24 Hours',
    'Last 7 Days',
    'Last 30 Days',
    'Custom Date Range',
  ] as const;

  const eventTypes = [
    'All Events',
    'Rainfall',
    'Thunderstorm',
    'Flood',
    'Heatwave',
    'Fog',
    'Dust Storm',
    'Strong Wind',
  ];

  const verificationStatuses = [
    'All',
    'Verified',
    'Unverified',
    'Suspicious',
    'Rejected',
  ];

  const dataSources = [
    'All Sources',
    'IMD',
    'OpenWeather',
    'Social Media',
    'Citizen Report',
    'Public Dataset',
    'Other',
  ];

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      dateRange: 'Today',
      state: 'All States',
      city: '',
      district: '',
      eventType: 'All Events',
      verificationStatus: 'All',
      dataSource: 'All Sources',
      searchQuery: '',
    };
    setLocalFilters(defaultFilters);
    onResetFilters();
  };

  // Identify active chips
  const activeChips: Array<{ key: keyof FilterState; label: string; value: string }> = [];

  if (filterState.dateRange !== 'Today') {
    activeChips.push({
      key: 'dateRange',
      label: 'Date',
      value: filterState.dateRange,
    });
  }
  if (filterState.state !== 'All States' && filterState.state) {
    activeChips.push({ key: 'state', label: 'State', value: filterState.state });
  }
  if (filterState.city) {
    activeChips.push({ key: 'city', label: 'City', value: filterState.city });
  }
  if (filterState.district) {
    activeChips.push({
      key: 'district',
      label: 'District',
      value: filterState.district,
    });
  }
  if (filterState.eventType !== 'All Events' && filterState.eventType) {
    activeChips.push({
      key: 'eventType',
      label: 'Event',
      value: filterState.eventType,
    });
  }
  if (filterState.verificationStatus !== 'All' && filterState.verificationStatus) {
    activeChips.push({
      key: 'verificationStatus',
      label: 'Verification',
      value: filterState.verificationStatus,
    });
  }
  if (
    filterState.dataSource !== 'All Sources' &&
    filterState.dataSource !== 'All' &&
    filterState.dataSource
  ) {
    activeChips.push({
      key: 'dataSource',
      label: 'Source',
      value: filterState.dataSource,
    });
  }

  const removeChip = (key: keyof FilterState) => {
    const updated = { ...filterState };
    if (key === 'dateRange') updated.dateRange = 'Today';
    if (key === 'state') updated.state = 'All States';
    if (key === 'city') updated.city = '';
    if (key === 'district') updated.district = '';
    if (key === 'eventType') updated.eventType = 'All Events';
    if (key === 'verificationStatus') updated.verificationStatus = 'All';
    if (key === 'dataSource') updated.dataSource = 'All Sources';

    setLocalFilters(updated);
    onFilterChange(updated);
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-850 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Advanced Filters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-source big data querying & geographic parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {totalFilteredCount} Reports Matched
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Filter Body */}
      {isExpanded && (
        <form onSubmit={handleApply} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* 1. Date Range */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Date Range</span>
              </label>
              <select
                value={localFilters.dateRange}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateRange: e.target.value as FilterState['dateRange'],
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {dateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {localFilters.dateRange === 'Custom Date Range' && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={localFilters.customStartDate || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        customStartDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="date"
                    value={localFilters.customEndDate || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        customEndDate: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              )}
            </div>

            {/* 2. Location (State & City) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>State & Region</span>
              </label>
              <select
                value={localFilters.state}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, state: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Event Type */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Cloud className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Event Type</span>
              </label>
              <select
                value={localFilters.eventType}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, eventType: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Verification Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verification Status</span>
              </label>
              <select
                value={localFilters.verificationStatus}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    verificationStatus: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {verificationStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Data Source */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Radio className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Data Source</span>
              </label>
              <select
                value={localFilters.dataSource}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dataSource: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {dataSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* District & City free-text refinement */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={localFilters.city}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, city: e.target.value })
              }
              placeholder="Filter by City (e.g. Mumbai, Chennai, Guwahati)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              value={localFilters.district}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, district: e.target.value })
              }
              placeholder="Filter by District / Locality (e.g. Kurla, T. Nagar)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Action buttons: Apply Filters & Reset Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                onClick={handleApply}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition"
              >
                <Check className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Query latency: <span className="font-mono text-emerald-600 dark:text-emerald-400">18ms</span> • Cached index: <span className="font-semibold text-slate-700 dark:text-slate-300">Live IMD/NDMA Big Data Lake</span>
            </div>
          </div>
        </form>
      )}

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 mr-1">
            Active Filters:
          </span>
          {activeChips.map((chip) => (
            <span
              key={`${chip.key}-${chip.value}`}
              className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:ring-sky-800"
            >
              <span className="text-slate-400 font-normal">{chip.label}:</span>
              <span>{chip.value}</span>
              <button
                onClick={() => removeChip(chip.key)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-sky-200/50 dark:hover:bg-sky-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleReset}
            className="text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400 ml-1"
          >
            Clear All
          </button>
        </div>
      )}
    </section>
  );
}
