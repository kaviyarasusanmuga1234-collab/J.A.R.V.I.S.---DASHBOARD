import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Bluetooth,
  Usb,
  Zap,
  HardDrive,
  Headphones,
  Mouse,
  Keyboard,
  Monitor,
  Smartphone,
  Plug,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Sliders,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  Power,
  RotateCcw,
} from 'lucide-react';
import { ConnectedDevice, ChargingPortInfo, UserLogEntry } from '../types';
import { soundFx } from '../utils/audioEffects';

interface ConnectedDevicesDashboardProps {
  devices: ConnectedDevice[];
  chargingPort: ChargingPortInfo;
  onUpdateDevices?: (devices: ConnectedDevice[]) => void;
  onUpdateChargingPort?: (port: Partial<ChargingPortInfo>) => void;
  onAddLog?: (action: string, severity?: UserLogEntry['severity'], category?: UserLogEntry['category'], details?: string) => void;
}

export const ConnectedDevicesDashboard: React.FC<ConnectedDevicesDashboardProps> = ({
  devices,
  chargingPort,
  onUpdateDevices,
  onUpdateChargingPort,
  onAddLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'wifi' | 'bluetooth' | 'usb' | 'charging'>('all');
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [isScanningUsb, setIsScanningUsb] = useState(false);
  const [ejectedDriveId, setEjectedDriveId] = useState<string | null>(null);
  const [fastChargeMode, setFastChargeMode] = useState<'fast' | 'normal' | 'protect80'>('fast');
  const [livePowerWatts, setLivePowerWatts] = useState(chargingPort.powerWatts);
  const [liveCurrentAmps, setLiveCurrentAmps] = useState(chargingPort.currentAmps);
  const [liveVoltageVolts, setLiveVoltageVolts] = useState(chargingPort.voltageVolts);
  const [speedTestActive, setSpeedTestActive] = useState(false);
  const [benchReadSpeed, setBenchReadSpeed] = useState(1050);
  const [benchWriteSpeed, setBenchWriteSpeed] = useState(1000);

  // Fluctuating live power delivery metrics
  useEffect(() => {
    const interval = setInterval(() => {
      if (chargingPort.isPluggedIn) {
        const delta = (Math.random() - 0.5) * 1.5;
        const newWatts = Math.min(98, Math.max(55, 65.4 + delta));
        const newVolts = 20.0 + (Math.random() - 0.5) * 0.2;
        const newAmps = newWatts / newVolts;
        setLivePowerWatts(newWatts);
        setLiveVoltageVolts(newVolts);
        setLiveCurrentAmps(newAmps);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [chargingPort.isPluggedIn]);

  // Handle Safely Ejecting a USB Device
  const handleEjectUsb = (id: string, name: string) => {
    soundFx.playAlert();
    setEjectedDriveId(id);
    onAddLog?.(
      `USB Device Ejected: ${name}`,
      'warning',
      'HARDWARE',
      `Safely unmounted from USB 3.2 bus. Cache flushed to storage.`
    );

    setTimeout(() => {
      if (onUpdateDevices) {
        const updated = devices.map((d) => (d.id === id ? { ...d, status: 'disconnected' as const } : d));
        onUpdateDevices(updated);
      }
      setEjectedDriveId(null);
    }, 1200);
  };

  // Handle Reconnect / Mount
  const handleMountUsb = (id: string, name: string) => {
    soundFx.playClick(1100);
    if (onUpdateDevices) {
      const updated = devices.map((d) => (d.id === id ? { ...d, status: 'active' as const } : d));
      onUpdateDevices(updated);
      onAddLog?.(`USB Device Mounted: ${name}`, 'success', 'HARDWARE', `Volume mounted as Drive E: (Ready for I/O)`);
    }
  };

  // Run USB Storage Read/Write Benchmark
  const handleRunBench = () => {
    soundFx.playScan();
    setSpeedTestActive(true);
    let count = 0;
    const benchTimer = setInterval(() => {
      count++;
      setBenchReadSpeed(Math.floor(1020 + Math.random() * 80));
      setBenchWriteSpeed(Math.floor(960 + Math.random() * 80));
      if (count > 6) {
        clearInterval(benchTimer);
        setSpeedTestActive(false);
        soundFx.playSuccess();
        onAddLog?.(
          'NVMe USB Benchmark Complete',
          'success',
          'HARDWARE',
          `Sequential Read: ${benchReadSpeed} MB/s | Sequential Write: ${benchWriteSpeed} MB/s`
        );
      }
    }, 300);
  };

  // Scan for Bluetooth Peripherals
  const handleScanBluetooth = async () => {
    soundFx.playScan();
    setIsScanningBt(true);
    onAddLog?.('Bluetooth 5.3 discovery scan initialized', 'info', 'NETWORK', 'Broadcasting BLE inquiries on 2.402-2.480 GHz');

    // Attempt real Web Bluetooth API if available in browser
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const navBt = (navigator as unknown as { bluetooth: { requestDevice: (opts: unknown) => Promise<{ name: string }> } }).bluetooth;
        const device = await navBt.requestDevice({
          acceptAllDevices: true,
        });
        if (device && device.name) {
          onAddLog?.(`Hardware BLE Device Discovered: ${device.name}`, 'success', 'NETWORK');
        }
      } catch (err) {
        // User cancelled picker or permission denied - fallback smoothly
      }
    }

    setTimeout(() => {
      setIsScanningBt(false);
      soundFx.playSuccess();
      onAddLog?.('Bluetooth scan complete. 4 peripheral nodes within nominal RSSI range.', 'info', 'NETWORK');
    }, 2400);
  };

  // Scan for USB Devices via WebUSB
  const handleScanWebUsb = async () => {
    soundFx.playScan();
    setIsScanningUsb(true);
    onAddLog?.('USB Host Controller bus interrogation started', 'info', 'HARDWARE', 'Probing Type-A and Type-C PHY lines');

    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        const navUsb = (navigator as unknown as { usb: { requestDevice: (opts: unknown) => Promise<{ productName: string }> } }).usb;
        const device = await navUsb.requestDevice({ filters: [] });
        if (device && device.productName) {
          onAddLog?.(`Real USB Hardware Intercepted: ${device.productName}`, 'success', 'HARDWARE');
        }
      } catch (err) {
        // User cancelled or unsupported
      }
    }

    setTimeout(() => {
      setIsScanningUsb(false);
      soundFx.playSuccess();
      onAddLog?.('USB controller scan complete: 5 ports active, 1 available', 'info', 'HARDWARE');
    }, 1800);
  };

  // Toggle Charging state
  const handleTogglePlug = () => {
    soundFx.playClick(1000);
    const newPlugged = !chargingPort.isPluggedIn;
    if (onUpdateChargingPort) {
      onUpdateChargingPort({
        isPluggedIn: newPlugged,
        status: newPlugged ? 'Fast Charging (PD)' : 'Discharging',
        powerWatts: newPlugged ? 65.4 : 0,
      });
    }
    onAddLog?.(
      newPlugged ? 'USB-C 100W PD Power Adapter Connected' : 'USB-C Power Cable Disconnected (Running on Battery)',
      newPlugged ? 'success' : 'warning',
      'HARDWARE'
    );
  };

  const getDeviceIcon = (iconType: ConnectedDevice['iconType']) => {
    switch (iconType) {
      case 'wifi':
        return <Wifi className="w-5 h-5 text-cyan-400" />;
      case 'bluetooth':
        return <Bluetooth className="w-5 h-5 text-blue-400" />;
      case 'usb':
        return <Usb className="w-5 h-5 text-emerald-400" />;
      case 'plug':
        return <Plug className="w-5 h-5 text-amber-400" />;
      case 'headphones':
        return <Headphones className="w-5 h-5 text-purple-400" />;
      case 'mouse':
        return <Mouse className="w-5 h-5 text-teal-400" />;
      case 'keyboard':
        return <Keyboard className="w-5 h-5 text-indigo-400" />;
      case 'hard-drive':
        return <HardDrive className="w-5 h-5 text-emerald-400" />;
      case 'monitor':
        return <Monitor className="w-5 h-5 text-sky-400" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-rose-400" />;
      default:
        return <Usb className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner / Hero HUD */}
      <div className="hud-card hud-corner-brackets rounded-xl p-4 relative overflow-hidden bg-gradient-to-r from-[#041226]/90 via-[#071936]/80 to-[#041226]/90 border border-cyan-500/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] relative">
              <Usb className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#041226] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-wider text-cyan-200">
                  REAL-TIME CONNECTED DEVICES & BUS TOPOLOGY
                </h1>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-[10px] font-tech text-cyan-300">
                  HOT-SWAP ENGINE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-tech mt-0.5">
                Live hardware monitoring for Wi-Fi 6, Bluetooth 5.3, USB 3.2 Gen 2 / Thunderbolt 4, and 100W USB-C Power Delivery.
              </p>
            </div>
          </div>

          {/* Quick Global Hardware Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-cyan-500/30 text-right">
              <div className="text-[10px] font-tech text-slate-400">TOTAL DEVICES</div>
              <div className="text-base font-display font-bold text-cyan-300">
                {devices.filter((d) => d.status === 'connected' || d.status === 'active').length} Active
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-amber-500/30 text-right">
              <div className="text-[10px] font-tech text-slate-400">BUS POWER DRAW</div>
              <div className="text-base font-display font-bold text-amber-300">
                {livePowerWatts.toFixed(1)}W PD
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playScan();
                onAddLog?.('Manual bus refresh triggered for all peripheral controllers', 'info', 'HARDWARE');
              }}
              className="p-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              title="Rescan All Busses"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cyan-500/20 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Peripherals', icon: Layers, count: devices.length },
            { id: 'wifi', label: 'Wi-Fi 6 WLAN', icon: Wifi, count: 1 },
            { id: 'bluetooth', label: 'Bluetooth 5.3 Peripherals', icon: Bluetooth, count: devices.filter((d) => d.type === 'bluetooth').length },
            { id: 'usb', label: 'USB & Thunderbolt Ports', icon: Usb, count: devices.filter((d) => d.type === 'usb').length },
            { id: 'charging', label: 'USB-C Charging & PD Lab', icon: Zap, count: 1 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick(1050);
                  setActiveSubTab(tab.id as typeof activeSubTab);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-tech font-semibold tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-black/30 hover:bg-cyan-950/40 text-slate-400 hover:text-cyan-300 border-cyan-500/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-cyan-400 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: CHARGING PORT & POWER DELIVERY LAB */}
      {(activeSubTab === 'all' || activeSubTab === 'charging') && (
        <div className="hud-card hud-corner-brackets rounded-xl p-4 border border-amber-500/40 relative overflow-hidden bg-gradient-to-br from-[#120e05]/70 to-[#040e1f]/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                <BatteryCharging className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wider text-amber-300 flex items-center gap-2">
                  CHARGING PORT & USB POWER DELIVERY (PD 3.1)
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-slate-300 font-tech">
                  Hardware Port: {chargingPort.portName} • Controller: Intel Thunderbolt 4 / USB-PD Controller
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlug}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all border cursor-pointer ${
                  chargingPort.isPluggedIn
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{chargingPort.isPluggedIn ? 'Simulate Unplug' : 'Plug In 100W PD'}</span>
              </button>
            </div>
          </div>

          {/* Dials & Gauges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* 1. Wattage */}
            <div className="p-3 rounded-lg bg-black/50 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                <span>INPUT POWER</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-amber-300">
                  {chargingPort.isPluggedIn ? livePowerWatts.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs font-mono text-amber-400/80">Watts</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500"
                  style={{ width: `${chargingPort.isPluggedIn ? (livePowerWatts / 100) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* 2. Voltage */}
            <div className="p-3 rounded-lg bg-black/50 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                <span>BUS VOLTAGE</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-cyan-300">
                  {chargingPort.isPluggedIn ? liveVoltageVolts.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs font-mono text-cyan-400/80">V DC</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">Fixed 20V EPR Rail</div>
            </div>

            {/* 3. Current */}
            <div className="p-3 rounded-lg bg-black/50 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                <span>AMPERAGE</span>
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-emerald-300">
                  {chargingPort.isPluggedIn ? liveCurrentAmps.toFixed(2) : '0.00'}
                </span>
                <span className="text-xs font-mono text-emerald-400/80">Amps</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">CC/CV Stage 2</div>
            </div>

            {/* 4. Cell Temperature & Health */}
            <div className="p-3 rounded-lg bg-black/50 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-tech text-slate-400">
                <span>BATTERY TEMP</span>
                <Shield className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-blue-300">
                  {chargingPort.temperatureC}°C
                </span>
                <span className="text-xs font-mono text-blue-400/80">Optimal</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">Health: 100% (48 Cycles)</div>
            </div>
          </div>

          {/* Animated Power Flow Visualizer */}
          <div className="bg-black/60 rounded-xl p-3 border border-amber-500/30 relative">
            <div className="flex items-center justify-between text-xs font-tech text-amber-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Plug className="w-3.5 h-3.5 text-amber-400" />
                POWER INJECTION PIPELINE & LITHIUM CELL CHARGE FLOW
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Protocol: {chargingPort.protocol}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-center">
              {/* Step 1: Wall Charger */}
              <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30">
                <div className="text-[10px] font-tech text-slate-400 uppercase">GaN Power Brick</div>
                <div className="font-tech text-xs font-bold text-amber-200">100W PD 3.1 Adapter</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">AC 220V ➔ DC 20V</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center justify-center text-amber-400 animate-pulse">
                <ArrowRight className="w-5 h-5" />
                <span className="text-[9px] font-mono">{livePowerWatts.toFixed(0)}W FLOW</span>
              </div>

              {/* Step 2: Thunderbolt Controller */}
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-[10px] font-tech text-slate-400 uppercase">USB-C PD Controller</div>
                <div className="font-tech text-xs font-bold text-cyan-200">Thunderbolt 4 PMIC</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">Thermal Regulated</div>
              </div>

              {/* Step 3: Battery Pack */}
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                <div className="text-[10px] font-tech text-slate-400 uppercase">Li-Polymer Battery</div>
                <div className="font-tech text-xs font-bold text-emerald-200">70 Wh (4-Cell 4S1P)</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">~{chargingPort.estimatedTimeToFull} to 100%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: USB PORTS & THUNDERBOLT CONTROLLER */}
      {(activeSubTab === 'all' || activeSubTab === 'usb') && (
        <div className="hud-card hud-corner-brackets rounded-xl p-4 border border-emerald-500/40 relative overflow-hidden bg-gradient-to-br from-[#021515]/70 to-[#041026]/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-emerald-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                <Usb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wider text-emerald-300">
                  USB CONTROLLERS & MOUNTED PERIPHERALS (USB 3.2 / TB4)
                </h3>
                <p className="text-[11px] text-slate-300 font-tech">
                  Intel USB 3.2 Gen 2x2 eXtensible Host Controller • Hot-Pluggable NVMe Drives & Audio DACs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleScanWebUsb}
                disabled={isScanningUsb}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-tech font-bold transition-all cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${isScanningUsb ? 'animate-spin' : ''}`} />
                <span>{isScanningUsb ? 'Probing USB Bus...' : 'Scan USB Hardware'}</span>
              </button>

              <button
                onClick={handleRunBench}
                disabled={speedTestActive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-tech font-bold transition-all cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 ${speedTestActive ? 'animate-spin' : ''}`} />
                <span>{speedTestActive ? 'Benchmarking...' : 'Test NVMe Speed'}</span>
              </button>
            </div>
          </div>

          {/* USB Speed Benchmark Result Ribbon if active */}
          {speedTestActive && (
            <div className="mb-3 p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between text-xs font-tech text-cyan-200 animate-pulse">
              <span>BENCHMARKING SAMSUNG T7 SHIELD USB 3.2 GEN 2...</span>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span className="text-emerald-300">READ: {benchReadSpeed} MB/s</span>
                <span className="text-amber-300">WRITE: {benchWriteSpeed} MB/s</span>
              </div>
            </div>
          )}

          {/* USB Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices
              .filter((d) => d.type === 'usb')
              .map((dev) => (
                <div
                  key={dev.id}
                  className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                    dev.status === 'active'
                      ? 'bg-black/40 border-emerald-500/30 hover:border-emerald-400/60'
                      : 'bg-black/20 border-slate-700 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          {getDeviceIcon(dev.iconType)}
                        </div>
                        <div>
                          <div className="font-tech text-xs font-bold text-slate-200 leading-tight">
                            {dev.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{dev.port}</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-tech">
                        {dev.status === 'active' ? 'MOUNTED' : 'UNMOUNTED'}
                      </span>
                    </div>

                    {/* Detailed Specs */}
                    <div className="space-y-1 text-[11px] font-mono bg-black/40 p-2 rounded border border-cyan-500/10 mb-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Speed:</span>
                        <span className="text-emerald-300">{dev.speed}</span>
                      </div>
                      {Object.entries(dev.details).slice(0, 2).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-slate-400 truncate">
                          <span>{key}:</span>
                          <span className="text-cyan-200 truncate ml-2">{String(val)}</span>
                        </div>
                      ))}
                      {dev.powerDrawWatts && (
                        <div className="flex justify-between text-slate-400">
                          <span>Power Draw:</span>
                          <span className="text-amber-300">{dev.powerDrawWatts} W</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Hot-swap Bus #1</span>
                    {dev.isRemovable && (
                      dev.status === 'active' ? (
                        <button
                          onClick={() => handleEjectUsb(dev.id, dev.name)}
                          disabled={ejectedDriveId === dev.id}
                          className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[10px] font-tech font-bold transition-all cursor-pointer"
                        >
                          {ejectedDriveId === dev.id ? 'Unmounting...' : 'Safely Eject'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMountUsb(dev.id, dev.name)}
                          className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-tech font-bold transition-all cursor-pointer"
                        >
                          Mount Drive
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 3: BLUETOOTH 5.3 PERIPHERAL MANAGER */}
      {(activeSubTab === 'all' || activeSubTab === 'bluetooth') && (
        <div className="hud-card hud-corner-brackets rounded-xl p-4 border border-blue-500/40 relative overflow-hidden bg-gradient-to-br from-[#03112b]/70 to-[#020b1c]/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-blue-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                <Bluetooth className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wider text-blue-300">
                  BLUETOOTH 5.3 ADAPTER & CONNECTED WIRELESS PERIPHERALS
                </h3>
                <p className="text-[11px] text-slate-300 font-tech">
                  Intel AX201 BLE Host • Low Energy Audio LE Isochronous Channels & HOGP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleScanBluetooth}
                disabled={isScanningBt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-tech font-bold transition-all cursor-pointer"
              >
                <Search className={`w-3.5 h-3.5 ${isScanningBt ? 'animate-spin' : ''}`} />
                <span>{isScanningBt ? 'Scanning 2.4 GHz BLE...' : 'Discover BLE Devices'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {devices
              .filter((d) => d.type === 'bluetooth')
              .map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-lg bg-black/40 border border-blue-500/30 hover:border-blue-400/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                          {getDeviceIcon(dev.iconType)}
                        </div>
                        <div>
                          <div className="font-tech text-xs font-bold text-slate-200 leading-tight">
                            {dev.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{dev.category}</div>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/40 font-tech">
                        CONNECTED
                      </span>
                    </div>

                    {/* Battery Bar & Signal Level */}
                    <div className="space-y-1.5 bg-black/40 p-2 rounded border border-blue-500/10 mb-2 font-mono text-[11px]">
                      {dev.batteryPercent !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Accessory Battery:</span>
                          <span className="text-emerald-300 font-bold">{dev.batteryPercent}% 🔋</span>
                        </div>
                      )}
                      {dev.rssi && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">BLE RSSI:</span>
                          <span className="text-blue-300">{dev.rssi} dBm (Nominal)</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Profile / Speed:</span>
                        <span className="text-cyan-300 truncate ml-1">{dev.speed}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-500 font-mono">Paired: {dev.connectedAt}</span>
                    <button
                      onClick={() => {
                        soundFx.playClick(900);
                        onAddLog?.(`Bluetooth link refreshed for ${dev.name}`, 'info', 'NETWORK');
                      }}
                      className="text-blue-400 hover:text-blue-200 transition-colors font-tech underline cursor-pointer"
                    >
                      Ping Node
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW 4: WI-FI 6 WLAN SUBSYSTEM */}
      {(activeSubTab === 'all' || activeSubTab === 'wifi') && (
        <div className="hud-card hud-corner-brackets rounded-xl p-4 border border-cyan-500/40 relative overflow-hidden bg-gradient-to-br from-[#021326]/70 to-[#010915]/90">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-cyan-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wider text-cyan-300">
                  WI-FI 6 DUAL-BAND WIRELESS ADAPTER
                </h3>
                <p className="text-[11px] text-slate-300 font-tech">
                  Intel Wi-Fi 6 AX201 160MHz PCIe • Connected to 5.180 GHz BSSID
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-tech font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EXCELLENT LINK (1,201 Mbps)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 font-mono text-xs space-y-1.5">
              <div className="text-[10px] font-tech text-slate-400 uppercase">NETWORK IDENTITY</div>
              <div className="font-bold text-cyan-200">STARK-NET-SECURE_5G</div>
              <div className="text-[11px] text-slate-400">MAC: 7C:10:C9:4A:88:2E</div>
              <div className="text-[11px] text-emerald-400">Security: WPA3-Personal</div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 font-mono text-xs space-y-1.5">
              <div className="text-[10px] font-tech text-slate-400 uppercase">RADIO FREQUENCY</div>
              <div className="font-bold text-cyan-200">5 GHz (Channel 36)</div>
              <div className="text-[11px] text-slate-400">Bandwidth: 80 MHz</div>
              <div className="text-[11px] text-cyan-400">RSSI: -46 dBm (94%)</div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 font-mono text-xs space-y-1.5">
              <div className="text-[10px] font-tech text-slate-400 uppercase">IP & GATEWAY</div>
              <div className="font-bold text-cyan-200">192.168.1.142</div>
              <div className="text-[11px] text-slate-400">Gateway: 192.168.1.1</div>
              <div className="text-[11px] text-blue-400">DNS: 1.1.1.1, 8.8.8.8</div>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 font-mono text-xs space-y-1.5">
              <div className="text-[10px] font-tech text-slate-400 uppercase">TX / RX LINK SPEED</div>
              <div className="font-bold text-emerald-300">1,201.0 Mbps</div>
              <div className="text-[11px] text-slate-400">Latency: 1.2 ms to AP</div>
              <div className="text-[11px] text-purple-400">MIMO: 2x2 Spatial Streams</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
