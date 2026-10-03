/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { SystemInfoWidget } from './components/SystemInfoWidget';
import { CenterCoreWidget } from './components/CenterCoreWidget';
import { HardwareWidget } from './components/HardwareWidget';
import { StorageWidget } from './components/StorageWidget';
import { NetworkWidget } from './components/NetworkWidget';
import { RoundWifiTracker } from './components/RoundWifiTracker';
import { LiveLocationDashboard } from './components/LiveLocationDashboard';
import { AiSubsystemsHub } from './components/AiSubsystemsHub';
import { MicrophoneWidget } from './components/MicrophoneWidget';
import { SecurityWidget } from './components/SecurityWidget';
import { LiveCameraWidget } from './components/LiveCameraWidget';
import { ProcessesWidget } from './components/ProcessesWidget';
import { UsersWidget } from './components/UsersWidget';
import { BatteryWidget } from './components/BatteryWidget';
import { WeatherWidget } from './components/WeatherWidget';
import { CmdTerminalWidget } from './components/CmdTerminalWidget';
import { KaliTerminalWidget } from './components/KaliTerminalWidget';
import { QuickCommandsWidget } from './components/QuickCommandsWidget';
import { UserLogsWidget } from './components/UserLogsWidget';
import { BottomStatusBar } from './components/BottomStatusBar';
import { WidgetCustomizerModal } from './components/WidgetCustomizerModal';
import { PowerModal } from './components/PowerModal';
import { NotepadModal } from './components/NotepadModal';
import { ConnectedDevicesWidget } from './components/ConnectedDevicesWidget';
import { ConnectedDevicesDashboard } from './components/ConnectedDevicesDashboard';

import {
  initialWidgets,
  initialSystemInfo,
  initialHardware,
  initialStorage,
  initialNetwork,
  initialProcesses,
  initialSecurity,
  initialWeather,
  initialUserProfile,
  initialBattery,
  initialUserLogs,
  initialConnectedDevices,
  initialChargingPort,
} from './data/mockSystemData';
import { WidgetConfig, ThemeColor, UserLogEntry, SystemInfo, ConnectedDevice, ChargingPortInfo } from './types';
import { soundFx } from './utils/audioEffects';
import { useRealSystemData } from './hooks/useRealSystemData';
import { testConnection, auth, db } from './lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function App() {
  // Real browser & device telemetry hook
  const realData = useRealSystemData();

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [networkViewMode, setNetworkViewMode] = useState<'classic' | 'radar'>('radar');

  // Modals state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPowerOpen, setIsPowerOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  // Theme & Settings
  const [theme, setTheme] = useState<ThemeColor>('jarvis-cyan');
  const [refreshRate, setRefreshRate] = useState<number>(2000);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);

  // System Data
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(() => ({
    ...initialSystemInfo,
    osName: realData.osName || initialSystemInfo.osName,
    architecture: realData.architecture || initialSystemInfo.architecture,
  }));
  const [hardware, setHardware] = useState(() => ({
    ...initialHardware,
    cpu: {
      ...initialHardware.cpu,
      cores: realData.cores || initialHardware.cpu.cores,
      threads: (realData.cores || 4) * 2,
    },
    ram: {
      ...initialHardware.ram,
      totalGb: realData.deviceMemoryGb || initialHardware.ram.totalGb,
    },
  }));
  const [storage, setStorage] = useState(initialStorage);
  const [network, setNetwork] = useState(initialNetwork);
  const [processes, setProcesses] = useState(initialProcesses);
  const [security, setSecurity] = useState(initialSecurity);
  const [weather, setWeather] = useState(initialWeather);
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [battery, setBattery] = useState(initialBattery);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(initialConnectedDevices);
  const [chargingPort, setChargingPort] = useState<ChargingPortInfo>(initialChargingPort);
  const [logs, setLogs] = useState<UserLogEntry[]>(initialUserLogs);

  // Test Firebase connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Update battery from real device if available
  useEffect(() => {
    if (realData.battery.supported) {
      setBattery((prev) => ({
        ...prev,
        remainingPercent: realData.battery.level,
        status: realData.battery.charging ? 'Charging' : 'Discharging',
        powerSource: realData.battery.charging ? 'AC Power' : 'Battery',
      }));
    }
  }, [realData.battery]);

  // Live ticking uptime
  const [uptimeSeconds, setUptimeSeconds] = useState(initialSystemInfo.uptimeSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${days} Days ${hours} Hours ${minutes} Minutes ${seconds}s`;
  };

  // Add Log helper
  const addLog = useCallback(
    (
      action: string,
      severity: UserLogEntry['severity'] = 'info',
      category: UserLogEntry['category'] = 'SYSTEM',
      details?: string
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const newEntry: UserLogEntry = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
        category,
        severity,
        action,
        details: details || `Telemetry event logged by J.A.R.V.I.S. Core`,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);

      // Save to Firebase if signed in
      if (auth.currentUser) {
        try {
          const logsRef = collection(db, `users/${auth.currentUser.uid}/logs`);
          addDoc(logsRef, {
            ...newEntry,
            userId: auth.currentUser.uid,
          }).catch(() => {});
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Live telemetry fluctuation simulation based on refreshRate
  useEffect(() => {
    if (refreshRate === 0) return;

    const interval = setInterval(() => {
      // Fluctuating CPU
      setHardware((prev) => {
        const delta = (Math.random() - 0.48) * 4;
        const newUsage = Math.max(8, Math.min(88, prev.cpu.usagePercent + delta));
        return {
          ...prev,
          cpu: {
            ...prev.cpu,
            usagePercent: parseFloat(newUsage.toFixed(1)),
          },
          ram: {
            ...prev.ram,
            usedGb: parseFloat((7.4 + Math.random() * 0.5).toFixed(1)),
            percent: Math.round(((7.4 + Math.random() * 0.5) / 15.8) * 100),
          },
        };
      });

      // Fluctuating Network Speeds
      setNetwork((prev) => {
        const deltaDown = (Math.random() - 0.49) * 8;
        const deltaUp = (Math.random() - 0.49) * 6;
        return {
          ...prev,
          downloadMbps: Math.max(90, Math.min(180, prev.downloadMbps + deltaDown)),
          uploadMbps: Math.max(70, Math.min(120, prev.uploadMbps + deltaUp)),
        };
      });

      // Fluctuating Processes CPU
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.pid === 0) return p;
          const delta = (Math.random() - 0.5) * 1.5;
          return {
            ...p,
            cpu: Math.max(0.1, parseFloat((p.cpu + delta).toFixed(1))),
          };
        })
      );
    }, refreshRate);

    return () => clearInterval(interval);
  }, [refreshRate]);

  // Kill Process Handler
  const handleKillProcess = (pid: number) => {
    const target = processes.find((p) => p.pid === pid);
    if (!target) return;
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    addLog(`Process terminated: ${target.name} (PID ${pid})`, 'warning', 'HARDWARE', `User aborted process thread`);
  };

  // Run Security Scan Handler
  const handleRunSecurityScan = () => {
    setSecurity((prev) => ({
      ...prev,
      lastScanTime: 'Just now',
      threatsFound: 0,
      scorePercent: 99,
    }));
    addLog('Comprehensive system security scan completed', 'success', 'SECURITY', 'Zero malicious signatures identified');
  };

  // Quick Command Triggers
  const handleNetworkScan = () => {
    addLog('Network port and gateway scan executed', 'info', 'NETWORK', 'Subnet 192.168.1.0/24 evaluated');
  };

  // Toggle widget visibility
  const handleToggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleResetWidgets = () => {
    setWidgets(initialWidgets);
    addLog('HUD widget layout reset to default preset', 'info', 'SYSTEM');
  };

  const isWidgetVisible = (id: string) => {
    const found = widgets.find((w) => w.id === id);
    return found ? found.enabled : true;
  };

  // Dynamic Theme Colors
  const getThemeClass = () => {
    switch (theme) {
      case 'stark-gold':
        return 'theme-gold text-amber-100';
      case 'matrix-green':
        return 'theme-matrix text-emerald-100';
      case 'synthwave':
        return 'theme-synthwave text-fuchsia-100';
      default:
        return 'theme-cyan text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen bg-[#030713] flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 scanline-overlay relative overflow-x-hidden ${getThemeClass()}`}>
      {/* Background Cyber Tech Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,rgba(0,240,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Top HUD Navigation Bar */}
      <TopNav
        weather={weather}
        micActive={micActive}
        setMicActive={setMicActive}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onTriggerJarvisPulse={() => addLog('J.A.R.V.I.S. Core diagnostics pulsed', 'info', 'SYSTEM')}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          addLog(`Navigation switched to ${tab.toUpperCase()}`, 'info', 'USER');
        }}
      />

      {/* Main Container: Sidebar + HUD Content Grid */}
      <div className="flex-1 flex flex-row relative z-10 w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            addLog(`Switched view context to: ${tab.toUpperCase()}`, 'info', 'USER');
          }}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onTriggerJarvisVoice={() => addLog('J.A.R.V.I.S. voice telemetry greeting played', 'info', 'SYSTEM')}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* HUD Content Area */}
        <main className="flex-1 p-3 lg:p-4 overflow-y-auto max-h-[calc(100vh-100px)] space-y-3.5">
          {/* 1. DEDICATED CONNECTED DEVICES & POWER PORTS TAB */}
          {activeTab === 'devices' && (
            <div className="animate-fadeIn">
              <ConnectedDevicesDashboard
                devices={connectedDevices}
                chargingPort={chargingPort}
                onUpdateDevices={setConnectedDevices}
                onUpdateChargingPort={(updated) => setChargingPort((prev) => ({ ...prev, ...updated }))}
                onAddLog={(action, severity, cat, details) => addLog(action, severity, cat, details)}
              />
            </div>
          )}

          {/* 2. DEDICATED WI-FI RADAR TAB */}
          {activeTab === 'radar' && (
            <div className="animate-fadeIn">
              <RoundWifiTracker />
            </div>
          )}

          {/* 2. DEDICATED LIVE LOCATION TAB */}
          {activeTab === 'location' && (
            <div className="animate-fadeIn">
              <LiveLocationDashboard />
            </div>
          )}

          {/* 3. DEDICATED AI SUBSYSTEMS & LABS TAB */}
          {activeTab === 'ai_hub' && (
            <div className="animate-fadeIn">
              <AiSubsystemsHub />
            </div>
          )}

          {/* 4. DEDICATED CMD TAB */}
          {activeTab === 'cmd' && (
            <div className="animate-fadeIn h-[calc(100vh-140px)]">
              <CmdTerminalWidget onAddLog={(action, details) => addLog(action, 'audit', 'TERMINAL', details)} />
            </div>
          )}

          {/* 5. DEDICATED KALI TAB */}
          {activeTab === 'kali' && (
            <div className="animate-fadeIn h-[calc(100vh-140px)]">
              <KaliTerminalWidget onAddLog={(action, details) => addLog(action, 'audit', 'TERMINAL', details)} />
            </div>
          )}

          {/* 6. DEDICATED LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="animate-fadeIn">
              <UserLogsWidget
                logs={logs}
                onClearLogs={() => {
                  setLogs([]);
                  soundFx.playAlert();
                }}
                onAddCustomLog={(action, severity, category) => {
                  addLog(action, severity, category, 'Manual test injection triggered');
                }}
              />
            </div>
          )}

          {/* 7. MAIN DASHBOARD VIEW (HOME OR SUB-SECTIONS) */}
          {(activeTab === 'home' ||
            ['system', 'hardware', 'network', 'storage', 'security', 'processes', 'users', 'camera', 'weather'].includes(activeTab)) && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* ROW 1: System Information, J.A.R.V.I.S. Core HUD, Hardware Overview, Storage (Total) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch">
                {/* System Information (4 cols) */}
                {isWidgetVisible('sys_info') && (
                  <div key="sys_info" className="xl:col-span-4 min-h-[220px] animate-glitch-in">
                    <SystemInfoWidget
                      systemInfo={systemInfo}
                      onUpdateSystemInfo={(updated) => {
                        setSystemInfo((prev) => ({ ...prev, ...updated }));
                        addLog('System configuration specifications updated', 'audit', 'SYSTEM');
                      }}
                      uptimeFormatted={formatUptime(uptimeSeconds)}
                      hardware={hardware}
                      processes={processes}
                      storage={storage}
                      network={network}
                      battery={battery}
                      connectedDevices={connectedDevices}
                      chargingPort={chargingPort}
                      onAddLog={(action, severity, cat, details) => addLog(action, severity, cat, details)}
                    />
                  </div>
                )}

                {/* J.A.R.V.I.S. Center Core HUD (2 cols) */}
                {isWidgetVisible('center_core') && (
                  <div key="center_core" className="xl:col-span-2 min-h-[220px] animate-glitch-in">
                    <CenterCoreWidget
                      onTriggerPulse={() => addLog('J.A.R.V.I.S. Core reactor pulsed', 'info', 'SYSTEM')}
                    />
                  </div>
                )}

                {/* Hardware Overview (3 cols) */}
                {isWidgetVisible('hardware') && (
                  <div key="hardware" className="xl:col-span-3 min-h-[220px] animate-glitch-in">
                    <HardwareWidget hardware={hardware} />
                  </div>
                )}

                {/* Storage (Total) (3 cols) */}
                {isWidgetVisible('storage') && (
                  <div key="storage" className="xl:col-span-3 min-h-[220px] animate-glitch-in">
                    <StorageWidget drives={storage} />
                  </div>
                )}
              </div>

              {/* REAL-TIME CONNECTED DEVICES & BUS TOPOLOGY WIDGET */}
              {isWidgetVisible('connected_devices') && (
                <div key="connected_devices" className="w-full min-h-[175px] animate-glitch-in">
                  <ConnectedDevicesWidget
                    devices={connectedDevices}
                    chargingPort={chargingPort}
                    onOpenDetailedDashboard={() => {
                      setActiveTab('devices');
                      addLog('Opened full Connected Devices & Ports deep telemetry console', 'info', 'HARDWARE');
                    }}
                    onEjectDevice={(id) => {
                      const dev = connectedDevices.find((d) => d.id === id);
                      if (dev) {
                        const updated = connectedDevices.map((d) =>
                          d.id === id ? { ...d, status: 'disconnected' as const } : d
                        );
                        setConnectedDevices(updated);
                        addLog(`Safely disconnected ${dev.name}`, 'warning', 'HARDWARE');
                      }
                    }}
                  />
                </div>
              )}

              {/* ROW 2: Network & Wi-Fi Round Tracker Toggle, Microphone, Security Level, Live Camera */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch">
                {/* Network & Internet with Round Wi-Fi Tracker switcher (4 cols) */}
                {isWidgetVisible('network') && (
                  <div key="network" className="xl:col-span-4 min-h-[200px] flex flex-col animate-glitch-in">
                    <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-tech text-cyan-400">
                      <span>NETWORK RADAR MODE</span>
                      <div className="flex items-center gap-1 bg-[#051126] p-0.5 rounded border border-cyan-500/30">
                        <button
                          onClick={() => setNetworkViewMode('radar')}
                          className={`px-1.5 py-0.5 rounded ${
                            networkViewMode === 'radar' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'
                          }`}
                        >
                          Round Radar
                        </button>
                        <button
                          onClick={() => setNetworkViewMode('classic')}
                          className={`px-1.5 py-0.5 rounded ${
                            networkViewMode === 'classic' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'
                          }`}
                        >
                          Classic Telemetry
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      {networkViewMode === 'radar' ? (
                        <RoundWifiTracker compact={true} />
                      ) : (
                        <NetworkWidget network={network} />
                      )}
                    </div>
                  </div>
                )}

                {/* Microphone & Audio (2 cols) */}
                {isWidgetVisible('microphone') && (
                  <div key="microphone" className="xl:col-span-2 min-h-[200px] animate-glitch-in">
                    <MicrophoneWidget micActive={micActive} setMicActive={setMicActive} />
                  </div>
                )}

                {/* Security Level (3 cols) */}
                {isWidgetVisible('security') && (
                  <div key="security" className="xl:col-span-3 min-h-[200px] animate-glitch-in">
                    <SecurityWidget
                      security={security}
                      onRunScan={handleRunSecurityScan}
                    />
                  </div>
                )}

                {/* Live Camera (3 cols) */}
                {isWidgetVisible('camera') && (
                  <div key="camera" className="xl:col-span-3 min-h-[200px] animate-glitch-in">
                    <LiveCameraWidget />
                  </div>
                )}
              </div>

              {/* ROW 3: Running Processes (Top 5), Users, Battery (Laptop), Weather & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch">
                {/* Running Processes (Top 5) (4 cols) */}
                {isWidgetVisible('processes') && (
                  <div key="processes" className="xl:col-span-4 min-h-[190px] animate-glitch-in">
                    <ProcessesWidget
                      processes={processes}
                      onKillProcess={handleKillProcess}
                    />
                  </div>
                )}

                {/* Users (2 cols) */}
                {isWidgetVisible('users') && (
                  <div key="users" className="xl:col-span-2 min-h-[190px] animate-glitch-in">
                    <UsersWidget user={userProfile} />
                  </div>
                )}

                {/* Battery (Laptop) (3 cols) */}
                {isWidgetVisible('battery') && (
                  <div key="battery" className="xl:col-span-3 min-h-[190px] animate-glitch-in">
                    <BatteryWidget battery={battery} />
                  </div>
                )}

                {/* Weather & Time (3 cols) */}
                {isWidgetVisible('weather') && (
                  <div key="weather" className="xl:col-span-3 min-h-[190px] animate-glitch-in">
                    <WeatherWidget
                      weather={weather}
                      onUpdateCity={(newCity) => {
                        setWeather((prev) => ({ ...prev, city: newCity }));
                        addLog(`Weather observation city set to ${newCity}`, 'info', 'SYSTEM');
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ROW 4: CMD Terminal, Kali Linux Terminal, Quick Commands, Detailed User Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch">
                {/* CMD Terminal (3 cols) */}
                {isWidgetVisible('cmd_terminal') && (
                  <div key="cmd_terminal" className="xl:col-span-3 min-h-[250px] animate-glitch-in">
                    <CmdTerminalWidget
                      onAddLog={(action, details) => addLog(action, 'audit', 'TERMINAL', details)}
                    />
                  </div>
                )}

                {/* Kali Linux Terminal (3 cols) */}
                {isWidgetVisible('kali_terminal') && (
                  <div key="kali_terminal" className="xl:col-span-3 min-h-[250px] animate-glitch-in">
                    <KaliTerminalWidget
                      onAddLog={(action, details) => addLog(action, 'audit', 'TERMINAL', details)}
                    />
                  </div>
                )}

                {/* Quick Commands (2 cols) */}
                {isWidgetVisible('quick_commands') && (
                  <div key="quick_commands" className="xl:col-span-2 min-h-[250px] animate-glitch-in">
                    <QuickCommandsWidget
                      onRunCmd={() => {
                        setActiveTab('cmd');
                        addLog('Spawned CMD console session', 'audit', 'TERMINAL');
                      }}
                      onRunKali={() => {
                        setActiveTab('kali');
                        addLog('Spawned Kali Linux subsystem session', 'audit', 'TERMINAL');
                      }}
                      onShowSysInfo={() => {
                        addLog('Invoked system information diagnostics probe', 'info', 'SYSTEM');
                      }}
                      onNetworkScan={handleNetworkScan}
                      onOpenNotepad={() => setIsNotepadOpen(true)}
                      onOpenPower={() => setIsPowerOpen(true)}
                    />
                  </div>
                )}

                {/* Recent Activity & Detailed User Logs (4 cols) */}
                {isWidgetVisible('user_logs') && (
                  <div key="user_logs" className="xl:col-span-4 min-h-[250px] animate-glitch-in">
                    <UserLogsWidget
                      logs={logs}
                      onClearLogs={() => {
                        setLogs([]);
                        soundFx.playAlert();
                      }}
                      onAddCustomLog={(action, severity, category) => {
                        addLog(action, severity, category, 'Manual test injection triggered');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom HUD Status Bar */}
      <BottomStatusBar
        hardware={hardware}
        storage={storage}
        network={network}
        osName={systemInfo.osName}
        onOpenPower={() => setIsPowerOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Widget Customizer Modal */}
      <WidgetCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        widgets={widgets}
        onToggleWidget={handleToggleWidget}
        onResetWidgets={handleResetWidgets}
        currentTheme={theme}
        onSelectTheme={setTheme}
        refreshRate={refreshRate}
        onSelectRefreshRate={setRefreshRate}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundFx.enabled = next;
        }}
      />

      {/* System Power Directive Modal */}
      <PowerModal
        isOpen={isPowerOpen}
        onClose={() => setIsPowerOpen(false)}
        onLogAction={(action) => addLog(action, 'warning', 'SYSTEM')}
      />

      {/* Cyber Notepad Modal */}
      <NotepadModal
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
      />
    </div>
  );
}

