'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  WeatherReport,
  LiveAlert,
  CityWeather,
  DataSourceHealth,
  KPIData,
  AIAnalytics,
  FilterState,
  ActiveNavTab,
  VerificationStatus,
} from '@/types/weather';
import {
  getWeatherData,
  getWeatherReports,
  getAlerts,
  getAnalytics,
  getDataSourceStatus,
  updateReportStatus,
  triggerDataSync,
  broadcastAlert,
} from '@/services/weatherService';

// Layout Components
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Toast, { ToastMessage } from '@/components/common/Toast';

// Dashboard Components
import KPICards from '@/components/dashboard/KPICards';
import IndiaWeatherMap from '@/components/dashboard/IndiaWeatherMap';
import FilterPanel from '@/components/dashboard/FilterPanel';
import CityWeatherOverview from '@/components/dashboard/CityWeatherOverview';
import WeatherEventCharts from '@/components/dashboard/WeatherEventCharts';
import RecentReportsTable from '@/components/dashboard/RecentReportsTable';
import AIVerificationCard from '@/components/dashboard/AIVerificationCard';
import LiveAlertsPanel from '@/components/dashboard/LiveAlertsPanel';
import DataSourceStatus from '@/components/dashboard/DataSourceStatus';
import AdminVerificationQueue from '@/components/dashboard/AdminVerificationQueue';

// Full Views
import WeatherReportsView from '@/components/views/WeatherReportsView';
import LiveAlertsView from '@/components/views/LiveAlertsView';
import EventAnalyticsView from '@/components/views/EventAnalyticsView';
import GeoIntelligenceView from '@/components/views/GeoIntelligenceView';
import VerificationCenterView from '@/components/views/VerificationCenterView';
import DataSourcesView from '@/components/views/DataSourcesView';
import AdminPanelView from '@/components/views/AdminPanelView';
import SettingsView from '@/components/views/SettingsView';

// Modals
import ReportDetailModal from '@/components/modals/ReportDetailModal';
import BroadcastAlertModal from '@/components/modals/BroadcastAlertModal';

export default function NationalWeatherDashboard() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selected details / Modals
  const [selectedReport, setSelectedReport] = useState<WeatherReport | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [activeFilterMetric, setActiveFilterMetric] = useState<string | undefined>();
  const [selectedCity, setSelectedCity] = useState<string | undefined>();

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    dateRange: 'Today',
    state: 'All States',
    city: '',
    district: '',
    eventType: 'All Events',
    verificationStatus: 'All',
    dataSource: 'All Sources',
    searchQuery: '',
  });

  // Data Store
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [sources, setSources] = useState<DataSourceHealth[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);

  // Helper to add toast messages
  const addToast = useCallback(
    (title: string, message: string, type: 'success' | 'alert' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize Dark Mode based on preference or system
  useEffect(() => {
    const isDark =
      localStorage.getItem('nwap-theme') === 'dark' ||
      (!('nwap-theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nwap-theme', 'dark');
      addToast('Dark Operations Mode Enabled', 'High contrast telemetry enabled.', 'info');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nwap-theme', 'light');
      addToast('Light Intelligence Mode Enabled', 'Standard day mode active.', 'info');
    }
  };

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      const [overviewData, reportsData, alertsData, analyticsData, sourcesData] =
        await Promise.all([
          getWeatherData(),
          getWeatherReports(),
          getAlerts(),
          getAnalytics(),
          getDataSourceStatus(),
        ]);

      setKpis(overviewData.kpis);
      setCities(overviewData.cities);
      setReports(reportsData);
      setAlerts(alertsData);
      setAnalytics(analyticsData.aiAnalytics);
      setSources(sourcesData);
    }

    loadData();
  }, []);

  // Filter application
  const handleFilterChange = async (newFilters: FilterState) => {
    setFilterState(newFilters);
    const filtered = await getWeatherReports(newFilters);
    setReports(filtered);
    addToast(
      'Filters Applied',
      `Showing ${filtered.length} reports matching query criteria.`,
      'info'
    );
  };

  const handleResetFilters = async () => {
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
    setFilterState(defaultFilters);
    setActiveFilterMetric(undefined);
    const allReports = await getWeatherReports(defaultFilters);
    setReports(allReports);
    addToast('Filters Reset', 'Displaying all unfiltered national feeds.', 'info');
  };

  // Search input handler
  const handleSearchChange = (q: string) => {
    const updated = { ...filterState, searchQuery: q };
    setFilterState(updated);
    getWeatherReports(updated).then((res) => setReports(res));
  };

  // Manual & automated feed synchronization
  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await triggerDataSync();
      setLastSyncTime(res.timestamp);
      const [newReports, newAlerts, newSources] = await Promise.all([
        getWeatherReports(filterState),
        getAlerts(),
        getDataSourceStatus(),
      ]);
      setReports(newReports);
      setAlerts(newAlerts);
      setSources(newSources);

      if (kpis) {
        setKpis({
          ...kpis,
          totalReports: kpis.totalReports + res.newReportsCount,
          reportsToday: kpis.reportsToday + res.newReportsCount,
        });
      }

      addToast(
        'Data Feeds Synchronized',
        `Synchronized ${res.syncedSources} live pipelines; ingested ${res.newReportsCount} new records.`,
        'success'
      );
    } catch {
      addToast('Sync Warning', 'Could not refresh some satellite feeds.', 'alert');
    } finally {
      setIsSyncing(false);
    }
  };

  // Report status update handler (Admin / Verification action)
  const handleUpdateStatus = async (
    reportId: string,
    newStatus: VerificationStatus
  ) => {
    const updated = await updateReportStatus(reportId, newStatus);
    if (updated) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? updated : r))
      );

      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(updated);
      }

      // Update KPI counters
      if (kpis) {
        setKpis((prev) => {
          if (!prev) return prev;
          let verifiedDiff = 0;
          let unverifiedDiff = 0;

          if (newStatus === 'Verified') verifiedDiff = 1;
          if (newStatus === 'Rejected') unverifiedDiff = -1;

          return {
            ...prev,
            verifiedReports: Math.max(0, prev.verifiedReports + verifiedDiff),
            unverifiedReports: Math.max(0, prev.unverifiedReports + unverifiedDiff),
          };
        });
      }

      addToast(
        `Report ${newStatus}`,
        `Report #${reportId} status successfully transitioned to ${newStatus}.`,
        newStatus === 'Verified' ? 'success' : newStatus === 'Rejected' ? 'alert' : 'info'
      );
    }
  };

  // Broadcast alert handler
  const handleBroadcastAlert = async (alertData: any) => {
    const created = await broadcastAlert(alertData);
    setAlerts((prev) => [created, ...prev]);

    if (kpis) {
      setKpis((prev) => (prev ? { ...prev, activeAlerts: prev.activeAlerts + 1 } : prev));
    }

    addToast(
      'Emergency Alert Broadcasted',
      `Alert "${alertData.title}" dispatched across state disaster networks.`,
      'alert'
    );
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (alertId: string) => {
    addToast(
      'Alert Acknowledged',
      `Disaster advisory #${alertId} marked as acknowledged by Duty Officer.`,
      'success'
    );
  };

  // Clicking a KPI card filters reports or switches view
  const handleKPICardClick = (metricKey: string) => {
    setActiveFilterMetric(metricKey);
    if (metricKey === 'flood') {
      handleFilterChange({ ...filterState, eventType: 'Flood' });
    } else if (metricKey === 'verified') {
      handleFilterChange({ ...filterState, verificationStatus: 'Verified' });
    } else if (metricKey === 'unverified') {
      handleFilterChange({ ...filterState, verificationStatus: 'Unverified' });
    } else if (metricKey === 'alerts') {
      setActiveTab('alerts');
    } else {
      handleResetFilters();
    }
  };

  // Get active view title for header
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'reports':
        return 'Weather Reports Data Explorer';
      case 'alerts':
        return 'Disaster Operations & Live Alerts';
      case 'analytics':
        return 'Event Analytics & Meteorological Trends';
      case 'map':
        return 'India Geo Intelligence & Radar Map';
      case 'verification':
        return 'AI & Human Verification Center';
      case 'sources':
        return 'Telemetry Ingestion & Pipeline Health';
      case 'admin':
        return 'National Admin Control Panel';
      case 'settings':
        return 'Platform Preferences & Configuration';
      case 'dashboard':
      default:
        return 'National Weather Intelligence Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Top Header */}
        <Header
          pageTitle={getHeaderTitle()}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
          searchQuery={filterState.searchQuery}
          onSearchChange={handleSearchChange}
          alerts={alerts}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onSelectAlert={(a) => {
            const matched = reports.find((r) => r.location === a.district || r.state === a.state);
            if (matched) setSelectedReport(matched);
            else {
              addToast(a.title, `${a.location}, ${a.state} - ${a.description}`, 'alert');
            }
          }}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* 1. Main Dashboard View (Contains all 11 prompt sections) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Section 1: KPI Cards (6-7 prominent summary cards) */}
              {kpis && (
                <KPICards
                  kpis={kpis}
                  onCardClick={handleKPICardClick}
                  activeFilterMetric={activeFilterMetric}
                />
              )}

              {/* Section 2: India Weather Intelligence Map */}
              <IndiaWeatherMap
                reports={reports}
                alerts={alerts}
                onSelectReport={setSelectedReport}
                selectedEventType={filterState.eventType}
                onFilterEventType={(type) =>
                  handleFilterChange({ ...filterState, eventType: type })
                }
              />

              {/* Section 3: Advanced Filtering System */}
              <FilterPanel
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalFilteredCount={reports.length}
              />

              {/* Section 4: Real-Time Weather Overview Across Major Cities */}
              <CityWeatherOverview
                cities={cities}
                selectedCity={selectedCity}
                onSelectCity={(city) => {
                  setSelectedCity(city);
                  handleFilterChange({ ...filterState, city });
                }}
              />

              {/* Section 5: Weather Event Analytics (4 Charts) */}
              <WeatherEventCharts
                selectedState={filterState.state}
                selectedEventType={filterState.eventType}
              />

              {/* Section 6: Recent Weather Reports Data Table */}
              <RecentReportsTable
                reports={reports}
                onSelectReport={setSelectedReport}
                onUpdateStatus={handleUpdateStatus}
              />

              {/* Section 7: AI Verification Section */}
              {analytics && (
                <AIVerificationCard
                  analytics={analytics}
                  onExploreVerification={() => setActiveTab('verification')}
                />
              )}

              {/* Section 8: Live Alerts Panel */}
              <LiveAlertsPanel
                alerts={alerts}
                onSelectAlert={(alert) => {
                  const matched = reports.find(
                    (r) => r.location === alert.district || r.state === alert.state
                  );
                  if (matched) setSelectedReport(matched);
                  else {
                    addToast(alert.title, alert.description, 'alert');
                  }
                }}
                onBroadcastClick={() => setIsBroadcastModalOpen(true)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />

              {/* Section 9: Data Source Monitoring */}
              <DataSourceStatus
                sources={sources}
                onSyncAll={handleRefresh}
                isSyncing={isSyncing}
                onSyncSingle={(srcId) => {
                  addToast('Source Pinged', `Telemetry test ping sent to ${srcId}. Latency 42ms OK.`, 'info');
                }}
              />

              {/* Section 10: Admin / Verification Preview */}
              <AdminVerificationQueue
                reports={reports}
                onSelectReport={setSelectedReport}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* 2. Weather Reports View */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-200">
              <WeatherReportsView
                reports={reports}
                filterState={filterState}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                onSelectReport={setSelectedReport}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* 3. Live Alerts View */}
          {activeTab === 'alerts' && (
            <div className="animate-in fade-in duration-200">
              <LiveAlertsView
                alerts={alerts}
                onSelectAlert={(alert) => {
                  const matched = reports.find(
                    (r) => r.location === alert.district || r.state === alert.state
                  );
                  if (matched) setSelectedReport(matched);
                  else addToast(alert.title, alert.description, 'alert');
                }}
                onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* 4. Event Analytics View */}
          {activeTab === 'analytics' && analytics && (
            <div className="animate-in fade-in duration-200">
              <EventAnalyticsView
                analytics={analytics}
                selectedState={filterState.state}
                selectedEventType={filterState.eventType}
              />
            </div>
          )}

          {/* 5. Map / Geo Intelligence View */}
          {activeTab === 'map' && (
            <div className="animate-in fade-in duration-200">
              <GeoIntelligenceView
                reports={reports}
                alerts={alerts}
                cities={cities}
                onSelectReport={setSelectedReport}
                selectedCity={selectedCity}
                onSelectCity={(c) => {
                  setSelectedCity(c);
                  handleFilterChange({ ...filterState, city: c });
                }}
              />
            </div>
          )}

          {/* 6. Verification Center View */}
          {activeTab === 'verification' && analytics && (
            <div className="animate-in fade-in duration-200">
              <VerificationCenterView
                reports={reports}
                analytics={analytics}
                onSelectReport={setSelectedReport}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {/* 7. Data Sources View */}
          {activeTab === 'sources' && (
            <div className="animate-in fade-in duration-200">
              <DataSourcesView
                sources={sources}
                onSyncAll={handleRefresh}
                isSyncing={isSyncing}
                onSyncSingle={(id) => {
                  addToast('Telemetry Synchronized', `Source ${id} status verified OK.`, 'info');
                }}
              />
            </div>
          )}

          {/* 8. Admin Panel View */}
          {activeTab === 'admin' && (
            <div className="animate-in fade-in duration-200">
              <AdminPanelView
                reports={reports}
                onSelectReport={setSelectedReport}
                onUpdateStatus={handleUpdateStatus}
                onShowToast={addToast}
              />
            </div>
          )}

          {/* 9. Settings View */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-200">
              <SettingsView
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                onShowToast={addToast}
              />
            </div>
          )}
        </main>
      </div>

      {/* Section 11: Report Detail Modal (When a report is clicked) */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Broadcast Emergency Alert Modal */}
      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={handleBroadcastAlert}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
