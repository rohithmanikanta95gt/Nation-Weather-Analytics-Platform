'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  BarChart3,
  MapPin,
  ShieldCheck,
  Radio,
  Settings,
  ShieldAlert,
  CloudLightning,
  ChevronRight,
  User,
  X,
  RefreshCw,
} from 'lucide-react';
import { ActiveNavTab } from '@/types/weather';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lastSyncTime: string;
  isSyncing: boolean;
  onRefresh: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  mobileOpen,
  onCloseMobile,
  lastSyncTime,
  isSyncing,
  onRefresh,
}: SidebarProps) {
  const navItems: Array<{
    id: ActiveNavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Weather Reports', icon: FileText, badge: '14.8k' },
    {
      id: 'alerts',
      label: 'Live Alerts',
      icon: AlertTriangle,
      badge: '18 Active',
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'analytics', label: 'Event Analytics', icon: BarChart3 },
    { id: 'map', label: 'Map / Geo Intelligence', icon: MapPin },
    {
      id: 'verification',
      label: 'Verification Center',
      icon: ShieldCheck,
      badge: '412 AI Flagged',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
    },
    { id: 'sources', label: 'Data Sources', icon: Radio },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo and National Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white shadow-md shadow-sky-600/20">
              <CloudLightning className="h-6 w-6" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                IN
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  NWAP
                </span>
                <span className="rounded-sm bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  INDIA
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                National Weather Analytics
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Operations & Intelligence
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.badgeColor ||
                        (isActive
                          ? 'bg-sky-200/80 text-sky-900 dark:bg-sky-900 dark:text-sky-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick System Telemetry Card */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  System Status: <span className="text-emerald-600 dark:text-emerald-400">Live</span>
                </span>
              </div>
              <button
                onClick={onRefresh}
                title="Refresh All Feeds"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`}
                />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Last Sync: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSyncTime}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Sensor Feed:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">99.98% OK</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: User Profile */}
        <div className="border-t border-slate-200 p-3.5 dark:border-slate-800">
          <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-800 ring-2 ring-sky-500/20 dark:bg-sky-950 dark:text-sky-300">
                <User className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  Dr. Rajesh Sharma
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lead Meteorologist • NDMA
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
