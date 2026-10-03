import React from 'react';
import { HardDrive } from 'lucide-react';
import { StorageDrive } from '../types';

interface StorageWidgetProps {
  drives: StorageDrive[];
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ drives }) => {
  const totalStorageGb = drives.reduce((acc, d) => acc + d.totalGb, 0);
  const totalFreeGb = drives.reduce((acc, d) => acc + d.freeGb, 0);
  const totalUsedGb = totalStorageGb - totalFreeGb;
  const totalPercent = Math.round((totalUsedGb / totalStorageGb) * 100);

  const formatStorage = (gb: number) => {
    if (gb >= 1000) {
      return `${(gb / 1024).toFixed(2)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Storage (Total)
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
          NVMe & SSD
        </span>
      </div>

      {/* Drives list */}
      <div className="space-y-3">
        {drives.map((drive) => (
          <div key={drive.letter} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-tech">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-cyan-200">
                  {drive.letter} {drive.label}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {drive.totalGb.toFixed(1)} GB
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300 tabular-nums">
                {drive.freeGb.toFixed(1)} GB free
              </div>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full bg-[#05142b] h-3.5 rounded-sm p-0.5 border border-cyan-500/30 relative flex items-center">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400 rounded-[1px] transition-all duration-700 relative shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                style={{ width: `${drive.percent}%` }}
              />
              <span className="absolute right-1.5 text-[9px] font-mono font-bold text-cyan-100 drop-shadow-[0_0_4px_#000]">
                {drive.percent}%
              </span>
            </div>
          </div>
        ))}

        {/* Total Storage Summary */}
        <div className="pt-2 border-t border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-tech">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <span>Total Storage</span>
              <span className="font-mono text-cyan-100">{formatStorage(totalStorageGb)}</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 tabular-nums">
              {formatStorage(totalFreeGb)} free
            </div>
          </div>

          <div className="w-full bg-[#05142b] h-3.5 rounded-sm p-0.5 border border-cyan-400/40 relative flex items-center">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-300 rounded-[1px] transition-all duration-700 relative shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              style={{ width: `${totalPercent}%` }}
            />
            <span className="absolute right-1.5 text-[9px] font-mono font-bold text-white drop-shadow-[0_0_4px_#000]">
              {totalPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
