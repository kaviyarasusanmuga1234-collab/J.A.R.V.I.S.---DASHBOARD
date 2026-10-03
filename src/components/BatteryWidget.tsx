import React from 'react';
import { Battery, BatteryCharging } from 'lucide-react';
import { BatteryStatus } from '../types';

interface BatteryWidgetProps {
  battery: BatteryStatus;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({ battery }) => {
  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          {battery.status === 'Charging' ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          ) : (
            <Battery className="w-4 h-4 text-cyan-400" />
          )}
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Battery (Laptop)
          </h2>
        </div>

        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
          Li-Ion Smart
        </span>
      </div>

      {/* Battery stats & graphic */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Specs column */}
        <div className="col-span-8 space-y-1 text-xs font-tech">
          <div className="grid grid-cols-12 gap-y-1">
            <div className="col-span-5 text-slate-400">Status</div>
            <div className="col-span-7 text-cyan-200 font-mono">: {battery.status}</div>

            <div className="col-span-5 text-slate-400">Health</div>
            <div className="col-span-7 text-emerald-400 font-mono font-medium">: {battery.healthPercent}%</div>

            <div className="col-span-5 text-slate-400">Remaining</div>
            <div className="col-span-7 text-cyan-300 font-mono font-bold">: {battery.remainingPercent}%</div>

            <div className="col-span-5 text-slate-400">Estimated Time</div>
            <div className="col-span-7 text-cyan-200 font-mono">: {battery.estimatedTime}</div>
          </div>
        </div>

        {/* Battery Cell Graphic */}
        <div className="col-span-4 flex items-center justify-center">
          <div className="relative w-10 h-20 border-2 border-cyan-400/80 rounded-md p-1 bg-[#051329] flex flex-col justify-end shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            {/* Battery Terminal Nub on top */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-cyan-400 rounded-t-sm" />

            {/* Glowing fill percentage */}
            <div
              className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-sm shadow-[0_0_8px_#34d399] transition-all duration-700 relative"
              style={{ height: `${battery.remainingPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            </div>

            {/* Percentage text */}
            <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-white drop-shadow-[0_0_4px_#000]">
              {battery.remainingPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
