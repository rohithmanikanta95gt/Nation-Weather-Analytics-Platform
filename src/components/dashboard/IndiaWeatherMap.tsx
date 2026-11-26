'use client';

import React, { useState, useMemo } from 'react';
import {
  WeatherReport,
  WeatherEventType,
  LiveAlert,
} from '@/types/weather';
import {
  EVENT_STYLES,
  getEventStyle,
  getSeverityBadge,
} from '@/utils/weatherUtils';
import {
  Layers,
  Radio,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  CloudLightning,
  Waves,
  Sun,
  CloudFog,
  Wind,
} from 'lucide-react';

interface IndiaWeatherMapProps {
  reports: WeatherReport[];
  alerts?: LiveAlert[];
  onSelectReport: (report: WeatherReport) => void;
  selectedEventType?: string;
  onFilterEventType?: (type: string) => void;
}

export default function IndiaWeatherMap({
  reports,
  alerts = [],
  onSelectReport,
  selectedEventType = 'All Events',
  onFilterEventType,
}: IndiaWeatherMapProps) {
  const [activeReport, setActiveReport] = useState<WeatherReport | null>(null);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);
  const [showHeatZones, setShowHeatZones] = useState<boolean>(true);
  const [showClusters, setShowClusters] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({
    lat: '20.59° N',
    lng: '78.96° E',
  });

  // Calculate India bounding box for coordinate projection:
  // Lat: 8.0° N (South) to 37.0° N (North)
  // Lng: 68.0° E (West) to 97.5° E (East)
  const mapWidth = 900;
  const mapHeight = 980;

  const projectCoords = (lat: number, lng: number) => {
    // Albers-like pseudo-conic projection mapping to SVG 900x980 box
    const minLat = 7.5;
    const maxLat = 37.5;
    const minLng = 67.5;
    const maxLng = 97.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 50;
    // Invert Y because SVG coordinates increase downwards
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 120) + 60;

    return { x, y };
  };

  // Filtered reports for map markers
  const filteredMarkers = useMemo(() => {
    if (selectedEventType === 'All Events' || !selectedEventType) {
      return reports;
    }
    return reports.filter((r) => r.eventType === selectedEventType);
  }, [reports, selectedEventType]);

  // Categories for Legend
  const legendCategories: Array<{
    type: WeatherEventType;
    label: string;
    emoji: string;
    color: string;
    dotClass: string;
  }> = [
    { type: 'Rainfall', label: 'Rainfall', emoji: '🟦', color: '#3b82f6', dotClass: 'bg-blue-500' },
    { type: 'Thunderstorm', label: 'Thunderstorm', emoji: '🟪', color: '#a855f7', dotClass: 'bg-purple-500' },
    { type: 'Flood', label: 'Flood', emoji: '🟥', color: '#ef4444', dotClass: 'bg-red-500' },
    { type: 'Heatwave', label: 'Heatwave', emoji: '🟧', color: '#f97316', dotClass: 'bg-orange-500' },
    { type: 'Fog', label: 'Fog', emoji: '⬜', color: '#94a3b8', dotClass: 'bg-slate-400' },
    { type: 'Dust Storm', label: 'Dust Storm', emoji: '🟨', color: '#eab308', dotClass: 'bg-amber-500' },
    { type: 'Strong Wind', label: 'Strong Wind', emoji: '🟩', color: '#22c55e', dotClass: 'bg-emerald-500' },
  ];

  // Helper to render icon for event
  const renderEventIcon = (eventType: WeatherEventType, className: string = 'h-3.5 w-3.5') => {
    switch (eventType) {
      case 'Rainfall':
        return <CloudRain className={className} />;
      case 'Thunderstorm':
        return <CloudLightning className={className} />;
      case 'Flood':
        return <Waves className={className} />;
      case 'Heatwave':
        return <Sun className={className} />;
      case 'Fog':
        return <CloudFog className={className} />;
      case 'Dust Storm':
      case 'Strong Wind':
        return <Wind className={className} />;
      default:
        return <MapPin className={className} />;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const minLat = 7.5;
    const maxLat = 37.5;
    const minLng = 67.5;
    const maxLng = 97.5;

    const calcLng = minLng + (x / rect.width) * (maxLng - minLng);
    const calcLat = maxLat - (y / rect.height) * (maxLat - minLat);

    setMouseCoords({
      lat: `${calcLat.toFixed(2)}° N`,
      lng: `${calcLng.toFixed(2)}° E`,
    });
  };

  return (
    <section className="relative flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-850 overflow-hidden">
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              India Weather Intelligence Map
            </h2>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {filteredMarkers.length} Active Geo-Clusters
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time geospatial sensor telemetry & citizen report coordinates
          </p>
        </div>

        {/* Map Layers & Toggles */}
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showRadarSweep
                ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:ring-sky-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title="Toggle Doppler Radar Sweep Simulation"
          >
            <Radio className={`h-3.5 w-3.5 ${showRadarSweep ? 'animate-spin' : ''}`} />
            <span>Radar Sweep</span>
          </button>

          <button
            onClick={() => setShowHeatZones(!showHeatZones)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showHeatZones
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:ring-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title="Toggle Severe Weather Heat Zones"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Heat Zones</span>
          </button>

          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              showClusters
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title="Toggle Cluster Counts"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Clusters</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="border-l border-slate-200 p-1.5 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative h-[540px] w-full bg-radial from-slate-50 to-slate-100 dark:from-slate-900 dark:to-[#070b14] overflow-hidden">
        {/* Animated Doppler Radar Sweep Beam */}
        {showRadarSweep && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-40 dark:opacity-50"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="relative h-[620px] w-[620px] rounded-full border border-sky-400/30">
              <div className="absolute inset-12 rounded-full border border-sky-400/20" />
              <div className="absolute inset-28 rounded-full border border-sky-400/15" />
              <div className="absolute inset-44 rounded-full border border-sky-400/10" />

              {/* Crosshair lines */}
              <div className="absolute left-0 top-1/2 h-[1px] w-full bg-sky-400/20" />
              <div className="absolute left-1/2 top-0 h-full w-[1px] bg-sky-400/20" />

              {/* Sweeping Conic Beam */}
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  animationDuration: '7s',
                  background:
                    'conic-gradient(from 0deg at 50% 50%, rgba(56, 189, 248, 0.45) 0deg, rgba(56, 189, 248, 0.1) 45deg, transparent 90deg, transparent 360deg)',
                }}
              />
            </div>
          </div>
        )}

        {/* Interactive SVG Geographic Map */}
        <div
          className="relative h-full w-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 900 980"
            className="h-full w-full max-h-[540px] select-none"
            onMouseMove={handleMouseMove}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200/50 dark:text-slate-800/40"
                  strokeWidth="0.5"
                />
              </pattern>
              {/* Radial gradient for heat zones */}
              <radialGradient id="heatFlood" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatRain" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatHeatwave" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* India Territory Accurate Polygonal Silhouette */}
            <g className="transition-all duration-300">
              {/* Northern Zone (J&K, Ladakh, Himachal, Punjab, Haryana, Uttarakhand) */}
              <path
                d="M 270,75 L 340,60 L 410,95 L 430,160 L 380,210 L 320,230 L 250,190 L 230,120 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Western Zone (Rajasthan, Gujarat) */}
              <path
                d="M 230,220 L 320,230 L 350,330 L 310,420 L 240,430 L 170,410 L 150,340 L 170,250 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Central & Indo-Gangetic Zone (UP, MP, Bihar, Delhi, Jharkhand) */}
              <path
                d="M 330,225 L 530,240 L 620,320 L 580,440 L 420,470 L 350,340 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* North-East Zone (Assam, Meghalaya, Arunachal, Nagaland, Manipur, Tripura, Mizoram) */}
              <path
                d="M 640,290 L 760,250 L 830,270 L 840,360 L 750,420 L 660,380 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Deccan & Western Ghats Zone (Maharashtra, Goa, Karnataka) */}
              <path
                d="M 235,430 L 370,440 L 430,580 L 340,680 L 260,650 L 230,510 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Eastern Zone (West Bengal, Odisha, Chhattisgarh) */}
              <path
                d="M 440,460 L 600,430 L 650,560 L 530,640 L 440,560 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Southern Peninsula Zone (Telangana, Andhra Pradesh, Tamil Nadu, Kerala) */}
              <path
                d="M 340,680 L 460,630 L 520,740 L 440,900 L 370,890 L 320,780 Z"
                className="fill-slate-200/50 stroke-slate-300 hover:fill-slate-300/60 dark:fill-slate-800/40 dark:stroke-slate-700/80 dark:hover:fill-slate-800/70"
                strokeWidth="1.2"
              />

              {/* Coastal Edge & Island Indicators */}
              <circle cx="210" cy="850" r="10" className="fill-slate-300 dark:fill-slate-700/60" />
              <circle cx="810" cy="740" r="8" className="fill-slate-300 dark:fill-slate-700/60" />
              <circle cx="825" cy="820" r="12" className="fill-slate-300 dark:fill-slate-700/60" />
            </g>

            {/* Region Label Annotations */}
            <g className="text-[11px] font-semibold fill-slate-400 dark:fill-slate-500 select-none pointer-events-none">
              <text x="310" y="140">NORTHERN ZONE</text>
              <text x="210" y="320">WESTERN ZONE</text>
              <text x="430" y="340">INDO-GANGETIC</text>
              <text x="700" y="320">NORTH-EAST</text>
              <text x="280" y="540">WESTERN GHATS</text>
              <text x="510" y="520">EASTERN COAST</text>
              <text x="380" y="770">SOUTHERN PENINSULA</text>
            </g>

            {/* Severe Weather Heat Zones (Translucent Impact Polygons) */}
            {showHeatZones && (
              <g className="transition-opacity duration-300">
                {/* Mumbai Inundation Risk Zone */}
                <circle cx="240" cy="510" r="65" fill="url(#heatFlood)" />
                {/* Assam Brahmaputra Flood Basin */}
                <circle cx="730" cy="330" r="75" fill="url(#heatFlood)" />
                {/* Chennai Coastal Precipitation Zone */}
                <circle cx="430" cy="790" r="60" fill="url(#heatRain)" />
                {/* Ahmedabad Thermal Dome */}
                <circle cx="230" cy="410" r="55" fill="url(#heatHeatwave)" />
              </g>
            )}

            {/* Weather / Event Markers */}
            {filteredMarkers.map((report) => {
              const { x, y } = projectCoords(
                report.coordinates.lat,
                report.coordinates.lng
              );
              const style = getEventStyle(report.eventType);
              const isSelected = activeReport?.id === report.id;

              return (
                <g
                  key={report.id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={() => setActiveReport(report)}
                >
                  {/* Outer pulse wave for severe/high reports */}
                  {(report.severity === 'Severe' || report.severity === 'Extreme') && (
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      className="animate-ping"
                      fill={style.hex}
                      opacity="0.3"
                    />
                  )}

                  {/* Marker Circle Base */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '14' : '10'}
                    fill={style.hex}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="filter drop-shadow-md"
                  />

                  {/* Inner event type dot / icon indication */}
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ffffff"
                    opacity={isSelected ? 1 : 0.85}
                  />

                  {/* Cluster Count Badge */}
                  {showClusters && report.nearbyReportsCount > 4 && (
                    <g transform={`translate(${x + 6}, ${y - 12})`}>
                      <circle
                        cx="8"
                        cy="6"
                        r="7.5"
                        className="fill-slate-900 stroke-white dark:fill-white dark:stroke-slate-900"
                        strokeWidth="1.5"
                      />
                      <text
                        x="8"
                        y="9.5"
                        textAnchor="middle"
                        className="text-[9px] font-bold fill-white dark:fill-slate-900"
                      >
                        +{report.nearbyReportsCount}
                      </text>
                    </g>
                  )}

                  {/* City Label Below Pin */}
                  <text
                    x={x}
                    y={y + 18}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200 filter drop-shadow-xs"
                  >
                    {report.location}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover / Click Popup Dialog over the map */}
        {activeReport && (
          <div className="absolute left-6 bottom-6 z-20 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{
                    backgroundColor: getEventStyle(activeReport.eventType).hex,
                  }}
                >
                  {renderEventIcon(activeReport.eventType, 'h-4 w-4')}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeReport.location}, {activeReport.state}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activeReport.district} • {activeReport.timeAgo}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveReport(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  getSeverityBadge(activeReport.severity).badgeBg
                } ${getSeverityBadge(activeReport.severity).badgeText}`}
              >
                Severity: {activeReport.severity}
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                AI Confidence: {activeReport.confidence}%
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {activeReport.source}
              </span>
            </div>

            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
              {activeReport.description}
            </p>

            {activeReport.rainfallMm !== undefined && (
              <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center text-[10px] font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[9px]">Rainfall</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeReport.rainfallMm} mm
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Temp</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeReport.temperature || 28}°C
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Wind</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeReport.windSpeedKmh || 16} km/h
                  </span>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <span className="font-mono text-[10px] text-slate-400">
                ID: {activeReport.id}
              </span>
              <button
                onClick={() => {
                  onSelectReport(activeReport);
                  setActiveReport(null);
                }}
                className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs transition"
              >
                <span>View Full Details</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Live Coordinates Readout */}
        <div className="absolute right-4 bottom-4 z-10 hidden rounded-md bg-white/80 px-2 py-1 font-mono text-[10px] text-slate-500 backdrop-blur-xs dark:bg-slate-900/80 dark:text-slate-400 sm:block">
          Reticle: {mouseCoords.lat}, {mouseCoords.lng}
        </div>
      </div>

      {/* Map Legend matching user's exact specification */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40 sm:px-6">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Info className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>Event Categories:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {legendCategories.map((item) => {
            const isFilterActive = selectedEventType === item.type;
            const count = reports.filter((r) => r.eventType === item.type).length;

            return (
              <button
                key={item.type}
                onClick={() => {
                  if (onFilterEventType) {
                    onFilterEventType(isFilterActive ? 'All Events' : item.type);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition ${
                  isFilterActive
                    ? 'bg-white font-bold shadow-xs ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={`Filter by ${item.label} (${count} reports)`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.label}</span>
                <span className="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
