'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  ExternalLink,
} from 'lucide-react';
import { LiveAlert } from '@/types/weather';

interface HeaderProps {
  pageTitle?: string;
  onOpenMobileMenu: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  alerts: LiveAlert[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectAlert?: (alert: LiveAlert) => void;
}

export default function Header({
  pageTitle = 'National Weather Intelligence Dashboard',
  onOpenMobileMenu,
  onRefresh,
  isSyncing,
  searchQuery,
  onSearchChange,
  alerts,
  darkMode,
  onToggleDarkMode,
  onSelectAlert,
}: HeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Live ticking clock with IST representation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      };
      setCurrentDateTime(`${now.toLocaleDateString('en-IN', options)} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Data Streaming
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            Ministry of Earth Sciences • Central Weather Telemetry Hub
          </p>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reports, city, state, PIN or event category..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-12 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-sky-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            /
          </kbd>
        </div>
      </div>

      {/* Right: Clock, Refresh, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
            {currentDateTime || 'Loading IST...'}
          </span>
          <span className="text-[10px] text-slate-400">Indian Standard Time</span>
        </div>

        {/* Data Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-sky-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400 transition-all"
          title="Force Synchronize Ingestion Feeds"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-sky-600 dark:text-sky-400' : ''}`}
          />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Feeds'}</span>
        </button>

        {/* Dark/Light Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            aria-label="View weather notifications"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Modal / Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Emergency Alerts ({alerts.length})
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (onSelectAlert) onSelectAlert(alert);
                    }}
                    className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-sky-800 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {alert.title}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800 dark:bg-red-950/80 dark:text-red-300">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{alert.location}, {alert.state}</span>
                      <span>{alert.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-center dark:border-slate-800">
                <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                  Continuous broadcast monitoring via IMD/CWC
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-xs font-bold text-white">
            RS
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
        </div>
      </div>
    </header>
  );
}
