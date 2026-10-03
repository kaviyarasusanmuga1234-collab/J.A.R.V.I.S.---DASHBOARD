export type ThemeColor = 'jarvis-cyan' | 'stark-gold' | 'matrix-green' | 'synthwave';

export interface WidgetConfig {
  id: string;
  name: string;
  category: 'system' | 'telemetry' | 'hardware' | 'network' | 'tools' | 'logs';
  enabled: boolean;
  order: number;
  colSpan?: 1 | 2 | 3 | 4;
}

export interface SystemInfo {
  osName: string;
  version: string;
  architecture: string;
  computerName: string;
  manufacturer: string;
  model: string;
  lastBoot: string;
  uptimeSeconds: number;
}

export interface HardwareMetrics {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    maxSpeedGhz: number;
    usagePercent: number;
    tempCelsius: number;
    history: number[];
  };
  ram: {
    totalGb: number;
    usedGb: number;
    percent: number;
  };
  gpu: {
    model: string;
    memoryMb: number;
    usagePercent: number;
    tempCelsius: number;
  };
}

export interface StorageDrive {
  letter: string;
  label: string;
  totalGb: number;
  freeGb: number;
  usedGb: number;
  percent: number;
}

export interface NetworkMetrics {
  status: 'connected' | 'disconnected' | 'connecting';
  type: string;
  networkName: string;
  ipAddress: string;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  wifiSignalDbm: number;
  bluetoothSignalDbm: number;
  historyDown: number[];
  historyUp: number[];
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpu: number;
  memoryMb: number;
  status: 'Running' | 'Suspended';
  user: string;
}

export interface UserLogEntry {
  id: string;
  timestamp: string;
  category: 'SYSTEM' | 'NETWORK' | 'SECURITY' | 'HARDWARE' | 'USER' | 'TERMINAL';
  severity: 'info' | 'warning' | 'error' | 'success' | 'audit';
  action: string;
  details?: string;
}

export interface SecurityStatus {
  overallLevel: 'High' | 'Medium' | 'Low' | 'Critical';
  scorePercent: number;
  firewall: boolean;
  antivirus: boolean;
  bitlocker: boolean;
  uac: boolean;
  threatsFound: number;
  isScanning: boolean;
  lastScanTime: string;
}

export interface WeatherData {
  city: string;
  country: string;
  tempCelsius: number;
  condition: string;
  highCelsius: number;
  lowCelsius: number;
  humidityPercent: number;
  windKmh: number;
  sunrise: string;
  sunset: string;
  forecast: {
    day: string;
    condition: string;
    high: number;
    low: number;
  }[];
}

export interface UserProfile {
  username: string;
  userType: string;
  profilePath: string;
  domain: string;
  loggedInUptime: string;
}

export interface BatteryStatus {
  status: 'Charging' | 'Discharging' | 'Full';
  healthPercent: number;
  remainingPercent: number;
  estimatedTime: string;
  powerSource: 'AC Power' | 'Battery';
}

export type DeviceConnectionType = 'wifi' | 'bluetooth' | 'usb' | 'charging_port' | 'display' | 'audio';

export interface ConnectedDevice {
  id: string;
  name: string;
  type: DeviceConnectionType;
  category: string;
  status: 'connected' | 'disconnected' | 'pairing' | 'active' | 'transferring' | 'ejecting';
  port: string;
  speed?: string;
  details: Record<string, string | number | boolean>;
  batteryPercent?: number;
  rssi?: number; // dBm for wireless
  signalPercent?: number;
  iconType: 'wifi' | 'bluetooth' | 'usb' | 'plug' | 'headphones' | 'mouse' | 'keyboard' | 'hard-drive' | 'monitor' | 'smartphone';
  connectedAt: string;
  isRemovable?: boolean;
  powerDrawWatts?: number;
}

export interface ChargingPortInfo {
  portName: string;
  connectorType: string; // e.g. "USB-C Thunderbolt 4"
  status: 'Fast Charging (PD)' | 'Normal Charging' | 'Trickle Charge' | 'Discharging' | 'Plugged (Not Charging)';
  isPluggedIn: boolean;
  voltageVolts: number;
  currentAmps: number;
  powerWatts: number;
  maxRatedWatts: number;
  protocol: string; // e.g. "USB Power Delivery 3.1 EPR"
  temperatureC: number;
  batteryHealthPercent: number;
  cycleCount: number;
  estimatedTimeToFull: string;
}

