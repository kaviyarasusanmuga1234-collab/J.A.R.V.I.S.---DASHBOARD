import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Bluetooth,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sliders,
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';
import { WeatherData } from '../types';

interface TopNavProps {
  weather: WeatherData;
  micActive: boolean;
  setMicActive: (val: boolean) => void;
  onOpenCustomizer: () => void;
  onTriggerJarvisPulse: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  weather,
  micActive,
  setMicActive,
  onOpenCustomizer,
  onTriggerJarvisPulse,
  onNavigateTab,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [wifiConnected, setWifiConnected] = useState<boolean>(true);
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(true);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playClick(950);
  };

  const toggleMic = () => {
    soundFx.playClick();
    setMicActive(!micActive);
  };

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('shower')) return <CloudRain className="w-3.5 h-3.5 text-cyan-300" />;
    if (c.includes('thunder')) return <CloudLightning className="w-3.5 h-3.5 text-amber-300" />;
    if (c.includes('cloud')) return <CloudSun className="w-3.5 h-3.5 text-sky-300" />;
    return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <header className="w-full bg-[#050e21]/95 border-b border-cyan-500/30 px-3 lg:px-6 py-2.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,229,255,0.08)] backdrop-blur-md relative z-30">
      {/* Left: J.A.R.V.I.S. Arc reactor branding */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => {
            soundFx.playChime();
            onTriggerJarvisPulse();
          }}
          className="relative group p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-cyan-400"
          title="Click to pulse J.A.R.V.I.S. Core"
        >
          <div className="w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-950/50 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-transform group-hover:scale-105">
            {/* Spinning Arc Reactor Gear */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none" />
            <div className="absolute inset-1 rounded-full border border-cyan-500/30" />
            {/* Inner Reactor Triangle */}
            <svg viewBox="0 0 40 40" className="w-7 h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]">
              <polygon points="20,6 34,31 6,31" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="20" cy="22" r="5" fill="#00f0ff" opacity="0.8" />
              <line x1="20" y1="6" x2="20" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="6" y1="31" x2="16" y2="24" stroke="currentColor" strokeWidth="1.5" />
              <line x1="34" y1="31" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        </button>

        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-2xl lg:text-3xl font-black tracking-widest text-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.7)] flex items-center gap-1.5">
              J.A.R.V.I.S.
            </h1>
          </div>
          <p className="text-[11px] font-tech text-cyan-200/90 tracking-wide font-medium leading-none">
            Just A Rather Very Intelligent System
          </p>
          <p className="text-[10px] text-cyan-400/70 italic tracking-wider leading-tight">
            Your System. My Priority.
          </p>
        </div>

        {/* Animated Audio Equalizer Waveform & Listening State */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-cyan-500/20">
          <div className="flex items-center gap-0.5 h-6 px-1">
            {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-300"
                style={{
                  height: micActive ? `${h}%` : '20%',
                  opacity: micActive ? 0.9 : 0.3,
                  animation: micActive ? `waveOscillate ${0.8 + (i % 4) * 0.2}s ease-in-out infinite` : 'none',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-tech text-cyan-300/80">
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{micActive ? 'Listening...' : 'Standby'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Connectivity & Hardware Status Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* MIC Toggle */}
        <button
          onClick={toggleMic}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-tech font-semibold tracking-wider transition-all ${
            micActive
              ? 'bg-cyan-950/60 border-cyan-400/80 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.25)]'
              : 'bg-slate-900/60 border-slate-700 text-slate-400'
          }`}
        >
          {micActive ? <Mic className="w-3.5 h-3.5 text-cyan-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
          <span>MIC</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              micActive ? 'bg-cyan-400 text-slate-950 shadow-[0_0_8px_#00f0ff]' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {micActive ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Wi-Fi Status */}
        <button
          onClick={() => {
            soundFx.playClick();
            setWifiConnected(!wifiConnected);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-[#07152f]/70 text-xs font-tech hover:border-cyan-400/60 transition-colors"
          title="Toggle Wi-Fi connection"
        >
          <Wifi className={`w-3.5 h-3.5 ${wifiConnected ? 'text-cyan-400' : 'text-slate-500'}`} />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 leading-tight">Wi-Fi</div>
            <div className="text-xs font-semibold text-cyan-200 leading-none">
              {wifiConnected ? 'Connected' : 'Offline'}
            </div>
          </div>
          {/* Signal bars */}
          <div className="flex items-end gap-0.5 h-3.5 pl-1">
            <span className={`w-0.5 h-1.5 rounded-sm ${wifiConnected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
            <span className={`w-0.5 h-2 rounded-sm ${wifiConnected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
            <span className={`w-0.5 h-2.5 rounded-sm ${wifiConnected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
            <span className={`w-0.5 h-3.5 rounded-sm ${wifiConnected ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          </div>
        </button>

        {/* Bluetooth Status */}
        <button
          onClick={() => {
            soundFx.playClick();
            setBluetoothConnected(!bluetoothConnected);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-[#07152f]/70 text-xs font-tech hover:border-cyan-400/60 transition-colors"
          title="Toggle Bluetooth"
        >
          <Bluetooth className={`w-3.5 h-3.5 ${bluetoothConnected ? 'text-blue-400' : 'text-slate-500'}`} />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 leading-tight">Bluetooth</div>
            <div className="text-xs font-semibold text-blue-200 leading-none">
              {bluetoothConnected ? 'Connected' : 'Disabled'}
            </div>
          </div>
          <div className="flex items-end gap-0.5 h-3.5 pl-1">
            <span className={`w-0.5 h-1.5 rounded-sm ${bluetoothConnected ? 'bg-blue-400' : 'bg-slate-700'}`} />
            <span className={`w-0.5 h-2.5 rounded-sm ${bluetoothConnected ? 'bg-blue-400' : 'bg-slate-700'}`} />
            <span className={`w-0.5 h-3.5 rounded-sm ${bluetoothConnected ? 'bg-blue-400' : 'bg-slate-700'}`} />
          </div>
        </button>

        {/* Audio Effects Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg border text-xs transition-colors ${
            soundEnabled
              ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40 hover:border-cyan-400'
              : 'border-slate-800 text-slate-500 bg-slate-900/60'
          }`}
          title={soundEnabled ? 'HUD Audio SFX Enabled (Click to mute)' : 'HUD Audio Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Quick Nav Shortcuts */}
        {onNavigateTab && (
          <div className="hidden xl:flex items-center gap-1.5 border-l border-cyan-500/30 pl-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateTab('radar');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-tech font-bold transition-all cursor-pointer"
            >
              WI-FI RADAR
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateTab('location');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-300 text-xs font-tech font-bold transition-all cursor-pointer"
            >
              LIVE LOCATION
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigateTab('ai_hub');
              }}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 text-xs font-tech font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              AI LABS
            </button>
          </div>
        )}

        {/* Customize Widgets Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenCustomizer();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/60 bg-cyan-500/20 text-cyan-300 text-xs font-tech font-semibold hover:bg-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize Widgets</span>
        </button>
      </div>

      {/* Right: Clock & Weather Card */}
      <div className="flex items-center gap-3 ml-auto lg:ml-0">
        {/* Clock & Date */}
        <div className="text-right px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#071329]/80 min-w-[130px]">
          <div className="font-mono tabular-nums text-lg lg:text-xl font-bold text-cyan-300 tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            {timeStr || '10:48:32 AM'}
          </div>
          <div className="text-[10px] font-tech text-cyan-400/80 tracking-widest">
            {dateStr || 'Tue, 30 Sep 2025'}
          </div>
        </div>

        {/* Weather Mini Banner */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#071736]/90 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <CloudSun className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <div>
              <div className="text-[11px] font-tech font-semibold text-cyan-200 leading-tight">
                {weather.city}, {weather.country}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {weather.tempCelsius}°C
                </span>
                <span className="text-[10px] text-cyan-300/80">{weather.condition}</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                H: {weather.highCelsius}° L: {weather.lowCelsius}° · Hum: {weather.humidityPercent}%
              </div>
            </div>
          </div>

          {/* 5-day mini forecast bar */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-cyan-500/30">
            {weather.forecast.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-[9px] font-tech text-slate-300">
                <span className="text-cyan-400 font-semibold">{item.day}</span>
                <div className="my-0.5">{getWeatherIcon(item.condition)}</div>
                <span className="font-mono text-[8px] text-slate-400 tabular-nums">
                  {item.high}°/{item.low}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
