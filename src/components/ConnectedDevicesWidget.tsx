import React from 'react';
import {
  Wifi,
  Bluetooth,
  Usb,
  Zap,
  HardDrive,
  Headphones,
  Mouse,
  ExternalLink,
  CheckCircle2,
  BatteryCharging,
  Radio,
} from 'lucide-react';
import { ConnectedDevice, ChargingPortInfo } from '../types';
import { soundFx } from '../utils/audioEffects';

interface ConnectedDevicesWidgetProps {
  devices: ConnectedDevice[];
  chargingPort: ChargingPortInfo;
  onOpenDetailedDashboard?: () => void;
  onEjectDevice?: (id: string) => void;
}

export const ConnectedDevicesWidget: React.FC<ConnectedDevicesWidgetProps> = ({
  devices,
  chargingPort,
  onOpenDetailedDashboard,
  onEjectDevice,
}) => {
  const wifiDevice = devices.find((d) => d.type === 'wifi');
  const btDevices = devices.filter((d) => d.type === 'bluetooth' && d.status === 'connected');
  const usbDevices = devices.filter((d) => d.type === 'usb' && d.status === 'active');

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 relative overflow-hidden flex flex-col justify-between h-full group">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            <Usb className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300 flex items-center gap-2">
              Connected Devices & Ports
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-[10px] font-tech text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{devices.filter((d) => d.status === 'connected' || d.status === 'active').length} ONLINE</span>
          </div>

          {onOpenDetailedDashboard && (
            <button
              onClick={() => {
                soundFx.playClick(1100);
                onOpenDetailedDashboard();
              }}
              className="p-1 rounded hover:bg-cyan-500/20 text-cyan-400 transition-colors flex items-center gap-1 text-[10px] font-tech"
              title="Open full Connected Devices dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Interactive Subsystem Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
        {/* 1. Wi-Fi */}
        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Wifi className="w-3 h-3 text-cyan-400" /> Wi-Fi 6
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          </div>
          <div className="font-tech text-xs font-bold text-cyan-200 truncate">
            {wifiDevice ? (wifiDevice.details.SSID as string) : 'STARK-NET-5G'}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/90 mt-1">
            <span>5.18 GHz</span>
            <span>-46 dBm</span>
          </div>
        </div>

        {/* 2. Bluetooth */}
        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/30 hover:border-blue-400/60 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Bluetooth className="w-3 h-3 text-blue-400" /> Bluetooth 5.3
            </span>
            <span className="text-[10px] font-tech text-blue-300 font-bold">{btDevices.length} Paired</span>
          </div>
          <div className="font-tech text-xs font-bold text-blue-200 truncate">
            {btDevices[0]?.name || 'Sony WH-1000XM5'}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-blue-300 mt-1">
            <span className="flex items-center gap-0.5">
              <Headphones className="w-2.5 h-2.5 text-blue-400" />
              {btDevices[0]?.batteryPercent ? `${btDevices[0].batteryPercent}% 🔋` : '88%'}
            </span>
            <span>+2 More</span>
          </div>
        </div>

        {/* 3. USB Devices */}
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-400/60 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Usb className="w-3 h-3 text-emerald-400" /> USB 3.2 Hub
            </span>
            <span className="text-[10px] font-tech text-emerald-300 font-bold">{usbDevices.length} Active</span>
          </div>
          <div className="font-tech text-xs font-bold text-emerald-200 truncate">
            {usbDevices[0]?.name || 'Samsung T7 SSD (1TB)'}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 mt-1">
            <span>10 Gbps Link</span>
            <span>NVMe Fast</span>
          </div>
        </div>

        {/* 4. Charging Port / USB-PD */}
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> USB-C PD Port
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="font-tech text-xs font-bold text-amber-200 truncate flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{chargingPort.powerWatts.toFixed(1)}W Fast Charge</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 mt-1">
            <span>{chargingPort.voltageVolts.toFixed(1)}V / {chargingPort.currentAmps.toFixed(2)}A</span>
            <span>31.2°C</span>
          </div>
        </div>
      </div>

      {/* Mini Active Peripherals List */}
      <div className="bg-black/40 rounded-lg border border-cyan-500/20 p-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-tech text-cyan-400 px-1">
          <span>REAL-TIME DETECTED PERIPHERALS & BUS TOPOLOGY</span>
          <span className="text-slate-400">HOT-PLUG READY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {/* Item 1 */}
          <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <HardDrive className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-slate-200 text-[11px] truncate">Samsung T7 SSD (1TB)</span>
            </div>
            {onEjectDevice && (
              <button
                onClick={() => {
                  soundFx.playAlert();
                  onEjectDevice('dev-usb-ssd');
                }}
                className="text-[9px] px-1 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 transition-colors ml-1 shrink-0"
                title="Safely Eject Drive"
              >
                Eject
              </button>
            )}
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Headphones className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="text-slate-200 text-[11px] truncate">Sony WH-1000XM5</span>
            </div>
            <span className="text-[10px] font-mono text-blue-300 shrink-0">88% 🔋</span>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Mouse className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="text-slate-200 text-[11px] truncate">MX Master 3S</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 shrink-0">92% 🔋</span>
          </div>
        </div>
      </div>
    </div>
  );
};
