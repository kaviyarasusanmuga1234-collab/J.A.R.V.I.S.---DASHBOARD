import React, { useState, useEffect } from 'react';
import { CloudSun, Sunrise, Sunset, Wind, Droplets, MapPin, Check } from 'lucide-react';
import { WeatherData } from '../types';
import { soundFx } from '../utils/audioEffects';

interface WeatherWidgetProps {
  weather: WeatherData;
  onUpdateCity: (city: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  onUpdateCity,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [newCity, setNewCity] = useState(weather.city);

  useEffect(() => {
    const update = () => {
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
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveCity = () => {
    soundFx.playClick();
    if (newCity.trim()) {
      onUpdateCity(newCity.trim());
    }
    setIsEditingCity(false);
  };

  return (
    <div className="hud-card hud-corner-brackets rounded-xl p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300">
            Weather & Time
          </h2>
        </div>

        {/* Editable City pill */}
        <div className="flex items-center gap-1">
          {isEditingCity ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="bg-black/80 border border-cyan-400 text-xs px-1.5 py-0.5 rounded text-cyan-200 w-24 focus:outline-none"
              />
              <button
                onClick={handleSaveCity}
                className="p-1 rounded bg-cyan-500/30 text-cyan-200 hover:bg-cyan-500/50"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsEditingCity(true);
              }}
              className="flex items-center gap-1 text-[10px] font-tech text-cyan-300 hover:text-cyan-100 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30"
              title="Click to change city"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{weather.city}, {weather.country}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Weather Left, Live Digital Clock Right */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Weather overview */}
        <div className="col-span-7 flex items-center gap-3">
          <CloudSun className="w-12 h-12 text-amber-400 shrink-0 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                {weather.tempCelsius}°C
              </span>
              <span className="text-xs font-tech text-cyan-300 font-medium">
                {weather.condition}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              H: {weather.highCelsius}° &nbsp; L: {weather.lowCelsius}°
            </div>

            {/* Astronomical sunrise/sunset */}
            <div className="flex items-center gap-3 text-[10px] font-tech text-amber-300/90 mt-1">
              <span className="flex items-center gap-1">
                <Sunrise className="w-3 h-3 text-amber-400" />
                <span>Sunrise: {weather.sunrise}</span>
              </span>
              <span className="flex items-center gap-1">
                <Sunset className="w-3 h-3 text-orange-400" />
                <span>Sunset: {weather.sunset}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Live Clock Right */}
        <div className="col-span-5 flex flex-col items-center justify-center p-2 rounded-lg bg-[#040e22]/90 border border-cyan-500/30 text-center">
          <div className="font-mono text-base sm:text-lg font-black text-cyan-200 tabular-nums drop-shadow-[0_0_8px_#00f0ff]">
            {timeStr || '10:48:32 AM'}
          </div>
          <div className="text-[10px] font-tech text-cyan-400 tracking-wider">
            {dateStr || 'Tue, 30 Sep 2025'}
          </div>
        </div>
      </div>
    </div>
  );
};
