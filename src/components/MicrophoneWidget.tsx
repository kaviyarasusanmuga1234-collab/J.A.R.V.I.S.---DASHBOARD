import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { soundFx } from '../utils/audioEffects';

interface MicrophoneWidgetProps {
  micActive: boolean;
  setMicActive: (val: boolean) => void;
}

export const MicrophoneWidget: React.FC<MicrophoneWidgetProps> = ({
  micActive,
  setMicActive,
}) => {
  const [volume, setVolume] = useState<number>(76);
  const [equalizerBars, setEqualizerBars] = useState<number[]>(
    Array.from({ length: 28 }, () => Math.floor(Math.random() * 60) + 15)
  );

  useEffect(() => {
    if (!micActive) return;
    const interval = setInterval(() => {
      setEqualizerBars((prev) =>
        prev.map(() => {
          const base = (volume / 100) * 85;
          return Math.floor(Math.random() * base) + 10;
        })
      );
    }, 120);
    return () => clearInterval(interval);
  }, [micActive, volume]);

  const toggleMic = () => {
    soundFx.playClick();
    setMicActive(!micActive);
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Microphone
          </h2>
        </div>

        <button
          onClick={toggleMic}
          className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold transition-all ${
            micActive
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {micActive ? 'Active' : 'Muted'}
        </button>
      </div>

      {/* Audio Waveform Equalizer */}
      <div className="w-full h-16 bg-[#030c1d] rounded-lg border border-cyan-500/30 p-2 flex items-center justify-between gap-1 relative overflow-hidden">
        {equalizerBars.map((height, idx) => (
          <span
            key={idx}
            className="flex-1 bg-gradient-to-t from-blue-600 via-cyan-400 to-cyan-200 rounded-sm transition-all duration-100"
            style={{
              height: micActive ? `${height}%` : '6%',
              opacity: micActive ? 0.9 : 0.2,
              boxShadow: micActive ? '0 0 6px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Status & Volume slider */}
      <div className="grid grid-cols-2 gap-3 mt-2 text-xs font-tech">
        <div>
          <div className="text-slate-400 text-[11px]">Status</div>
          <div className="text-cyan-200 font-mono font-medium flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                micActive ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
              }`}
            />
            <span>: {micActive ? 'Active' : 'Muted'}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Volume</span>
            <span className="text-cyan-300 font-mono font-bold">: {volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
          />
        </div>
      </div>
    </div>
  );
};
