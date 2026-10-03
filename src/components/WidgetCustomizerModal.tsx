import React from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sliders,
  Palette,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { WidgetConfig, ThemeColor } from '../types';
import { soundFx } from '../utils/audioEffects';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onResetWidgets: () => void;
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  refreshRate: number;
  onSelectRefreshRate: (rate: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const WidgetCustomizerModal: React.FC<WidgetCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onResetWidgets,
  currentTheme,
  onSelectTheme,
  refreshRate,
  onSelectRefreshRate,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  const themes: Array<{ id: ThemeColor; label: string; primary: string; glow: string }> = [
    { id: 'jarvis-cyan', label: 'J.A.R.V.I.S. Electric Cyan', primary: '#00f0ff', glow: 'rgba(0,240,255,0.4)' },
    { id: 'stark-gold', label: 'Mark VII Stark Arc Gold', primary: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
    { id: 'matrix-green', label: 'Cyberpunk Matrix Emerald', primary: '#10b981', glow: 'rgba(16,185,129,0.4)' },
    { id: 'synthwave', label: 'Synthwave Neon Violet', primary: '#c084fc', glow: 'rgba(192,132,252,0.4)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="hud-card hud-corner-brackets rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,240,255,0.25)] border-2 border-cyan-400/60 bg-[#040e22]">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-gradient-to-r from-cyan-950/60 to-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display text-base font-bold text-cyan-200 tracking-wider">
                HUD WIDGET CUSTOMIZER &amp; SETTINGS
              </h2>
              <p className="text-[11px] font-tech text-cyan-400/80">
                Calibrate monitor arrangement, telemetry frequencies, and color scheme
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Theme Palette Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-tech font-bold text-cyan-300">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>DASHBOARD HUD COLOR THEME</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectTheme(t.id);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-tech transition-all cursor-pointer ${
                    currentTheme === t.id
                      ? 'border-cyan-400 bg-cyan-950/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'border-slate-800 bg-[#051126] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: t.primary, boxShadow: `0 0 8px ${t.glow}` }}
                    />
                    <span className="font-medium">{t.label}</span>
                  </div>
                  {currentTheme === t.id && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Refresh Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-tech font-bold text-cyan-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>METRIC REFRESH INTERVAL</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'Real-time (1s)', val: 1000 },
                { label: 'Normal (2s)', val: 2000 },
                { label: 'Conserve (5s)', val: 5000 },
                { label: 'Paused', val: 0 },
              ].map((rate) => (
                <button
                  key={rate.val}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectRefreshRate(rate.val);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-tech transition-all cursor-pointer ${
                    refreshRate === rate.val
                      ? 'border-cyan-400 bg-cyan-500/30 text-cyan-100 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'border-slate-800 bg-[#051126] text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Widgets Visibility Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-tech font-bold text-cyan-300">
              <span>ACTIVE HUD WIDGETS ({widgets.filter((w) => w.enabled).length}/{widgets.length})</span>
              <button
                onClick={() => {
                  soundFx.playScan();
                  onResetWidgets();
                }}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default Layout</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  onClick={() => {
                    soundFx.playClick();
                    onToggleWidget(widget.id);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs font-tech transition-all cursor-pointer ${
                    widget.enabled
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                      : 'bg-black/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        widget.enabled ? 'bg-cyan-400 shadow-[0_0_6px_#00f0ff]' : 'bg-slate-700'
                      }`}
                    />
                    <span className="font-medium">{widget.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      widget.enabled ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {widget.enabled ? 'VISIBLE' : 'HIDDEN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio SFX toggle */}
          <div className="p-3 rounded-lg border border-cyan-500/30 bg-[#071736] flex items-center justify-between text-xs font-tech">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <div className="font-bold text-cyan-200">Sci-Fi Web Audio Synthesizer SFX</div>
                <div className="text-[11px] text-slate-400">
                  Synthesized high-tech computer blips, scans, and reactor chimes
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleSound();
              }}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                soundEnabled
                  ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00f0ff]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/30 bg-[#030919] flex justify-end gap-2">
          <button
            onClick={() => {
              soundFx.playChime();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-display text-xs font-bold tracking-wider hover:opacity-95 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            APPLY &amp; RETURN TO HUD
          </button>
        </div>
      </div>
    </div>
  );
};
