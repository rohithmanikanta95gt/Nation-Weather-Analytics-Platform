export type WeatherEventType =
  | 'Rainfall'
  | 'Thunderstorm'
  | 'Flood'
  | 'Heatwave'
  | 'Fog'
  | 'Dust Storm'
  | 'Strong Wind';

export type VerificationStatus =
  | 'Verified'
  | 'Unverified'
  | 'Suspicious'
  | 'Rejected';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extreme';

export type DataSourceType =
  | 'IMD'
  | 'OpenWeather'
  | 'Social Media'
  | 'Citizen Report'
  | 'Public Dataset'
  | 'Other';

export interface WeatherReport {
  id: string;
  timestamp: string;
  timeAgo: string;
  eventType: WeatherEventType;
  location: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  source: DataSourceType;
  verificationStatus: VerificationStatus;
  severity: SeverityLevel;
  confidence: number; // 0 to 100
  description: string;
  reporterInfo: string;
  duplicateProbability: number;
  duplicateOfId?: string;
  imageUrl?: string;
  nearbyReportsCount: number;
  verificationHistory: Array<{
    step: string;
    timestamp: string;
    note: string;
    status: string;
  }>;
  temperature?: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
}

export interface LiveAlert {
  id: string;
  title: string;
  location: string;
  district: string;
  state: string;
  eventType: WeatherEventType;
  severity: 'Severe' | 'High' | 'Moderate' | 'Warning';
  timeAgo: string;
  updatedAt: string;
  source: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedPopulation: string;
  advisoryAction: string;
  status: 'Active' | 'Under Review' | 'Resolved';
}

export interface CityWeather {
  city: string;
  state: string;
  temp: number;
  rainfallMm: number;
  windKmh: number;
  humidityPct: number;
  alert: string;
  alertLevel: 'normal' | 'moderate' | 'warning' | 'severe';
  condition: string;
  aqi: number;
  pressureHpa: number;
  coordinates: { lat: number; lng: number };
}

export interface DataSourceHealth {
  id: string;
  name: string;
  type: DataSourceType;
  status: 'Online' | 'Streaming' | 'Delayed' | 'Degraded' | 'Offline';
  lastSync: string;
  reportsCount: number;
  uptime: string;
  latencyMs: number;
  errorRate: string;
  endpoint: string;
}

export interface KPIData {
  totalReports: number;
  verifiedReports: number;
  unverifiedReports: number;
  activeAlerts: number;
  floodReports: number;
  extremeEvents: number;
  reportsToday: number;
  totalChangeToday: number;
  verifiedPercentage: number;
  floodSurgePercentage: number;
}

export interface AIAnalytics {
  reportsAnalysed: number;
  duplicatesRemoved: number;
  suspiciousDetected: number;
  verifiedCount: number;
  avgConfidence: number;
  distribution: {
    verified: number;
    suspicious: number;
    duplicate: number;
    rejected: number;
  };
}

export interface FilterState {
  dateRange: 'Today' | 'Last 24 Hours' | 'Last 7 Days' | 'Last 30 Days' | 'Custom Date Range';
  customStartDate?: string;
  customEndDate?: string;
  state: string;
  city: string;
  district: string;
  eventType: string;
  verificationStatus: string;
  dataSource: string;
  searchQuery: string;
}

export type ActiveNavTab =
  | 'dashboard'
  | 'reports'
  | 'alerts'
  | 'analytics'
  | 'map'
  | 'verification'
  | 'sources'
  | 'admin'
  | 'settings';
