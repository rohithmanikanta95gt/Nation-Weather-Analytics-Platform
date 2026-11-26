'use client';

import React, { useState } from 'react';
import { WeatherEventType, LiveAlert } from '@/types/weather';
import { INDIAN_STATES } from '@/data/mockData';
import {
  AlertTriangle,
  X,
  Send,
  Radio,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (alertData: {
    title: string;
    location: string;
    district: string;
    state: string;
    eventType: WeatherEventType;
    severity: 'Severe' | 'High' | 'Moderate' | 'Warning';
    source: string;
    description: string;
    affectedPopulation: string;
    advisoryAction: string;
    coordinates: { lat: number; lng: number };
  }) => void;
}

export default function BroadcastAlertModal({
  isOpen,
  onClose,
  onBroadcast,
}: BroadcastAlertModalProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [eventType, setEventType] = useState<WeatherEventType>('Flood');
  const [severity, setSeverity] = useState<'Severe' | 'High' | 'Moderate' | 'Warning'>('Severe');
  const [description, setDescription] = useState('');
  const [advisoryAction, setAdvisoryAction] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState('500K residents');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    onBroadcast({
      title,
      location,
      district: district || location,
      state,
      eventType,
      severity,
      source: 'National Disaster Management Authority (NDMA)',
      description,
      advisoryAction,
      affectedPopulation,
      coordinates: { lat: 19.076, lng: 72.8777 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Emergency Weather Advisory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct broadcast to regional disaster centers & citizen portals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Alert Title & Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Warning: Rapid River Surge"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-red-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Event Category
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as WeatherEventType)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Flood">Flood</option>
                <option value="Rainfall">Rainfall</option>
                <option value="Thunderstorm">Thunderstorm</option>
                <option value="Heatwave">Heatwave</option>
                <option value="Strong Wind">Strong Wind</option>
                <option value="Dust Storm">Dust Storm</option>
                <option value="Fog">Fog</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(
                    e.target.value as 'Severe' | 'High' | 'Moderate' | 'Warning'
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Severe">Severe (Red Alert)</option>
                <option value="High">High (Orange Alert)</option>
                <option value="Moderate">Moderate (Yellow Alert)</option>
                <option value="Warning">Warning (Advisory)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                City / Locality
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Kurla / Thane"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {INDIAN_STATES.filter((s) => s !== 'All States').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description & Threat Level
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the observed water level, rainfall intensity, or wind speed..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Immediate Advisory & Action Required
            </label>
            <input
              type="text"
              value={advisoryAction}
              onChange={(e) => setAdvisoryAction(e.target.value)}
              placeholder="e.g. Deploy SDRF response boats, divert traffic, activate pumping stations."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              Broadcast authority: National Emergency Management Protocol
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-700 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Broadcast Alert</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
