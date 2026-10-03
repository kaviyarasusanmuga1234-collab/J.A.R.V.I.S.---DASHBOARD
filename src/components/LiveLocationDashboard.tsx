import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  CloudSun,
  Clock,
  Navigation,
  Globe,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Sparkles,
  RefreshCw,
  Bookmark,
  Check,
  Search,
} from 'lucide-react';
import { soundFx } from '../utils/audioEffects';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  city: string;
  region: string;
  country: string;
  timezone: string;
}

interface LiveWeatherInfo {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  condition: string;
  sunrise: string;
  sunset: string;
  daily: Array<{
    day: string;
    max: number;
    min: number;
    condition: string;
  }>;
}

export const LiveLocationDashboard: React.FC = () => {
  // Default coordinates (Chennai / India)
  const [coords, setCoords] = useState<LocationCoords>({
    latitude: 13.0827,
    longitude: 80.2707,
    accuracy: 15,
    altitude: 18,
    speed: 0,
    heading: 90,
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    timezone: 'Asia/Kolkata',
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);
  const [localTimeStr, setLocalTimeStr] = useState('');
  const [localDateStr, setLocalDateStr] = useState('');
  const [weather, setWeather] = useState<LiveWeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live ticking clock in target timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        setLocalTimeStr(
          now.toLocaleTimeString('en-US', {
            timeZone: coords.timezone || 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
        );
        setLocalDateStr(
          now.toLocaleDateString('en-US', {
            timeZone: coords.timezone || 'Asia/Kolkata',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        );
      } catch {
        const now = new Date();
        setLocalTimeStr(now.toLocaleTimeString());
        setLocalDateStr(now.toLocaleDateString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [coords.timezone]);

  // Fetch real weather from Open-Meteo
  const fetchWeatherForCoords = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.current) {
        const getCondition = (code: number) => {
          if (code === 0) return 'Clear Sky';
          if (code <= 3) return 'Partly Cloudy';
          if (code <= 48) return 'Foggy';
          if (code <= 67) return 'Rain / Showers';
          if (code <= 77) return 'Snow';
          if (code <= 82) return 'Heavy Rain';
          if (code <= 99) return 'Thunderstorm';
          return 'Fair';
        };

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyForecast = (data.daily?.time || []).slice(0, 5).map((t: string, idx: number) => {
          const d = new Date(t);
          return {
            day: days[d.getDay()],
            max: Math.round(data.daily.temperature_2m_max[idx]),
            min: Math.round(data.daily.temperature_2m_min[idx]),
            condition: getCondition(data.daily.weather_code[idx]),
          };
        });

        const sunriseTime = data.daily?.sunrise?.[0]
          ? new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '06:05 AM';
        const sunsetTime = data.daily?.sunset?.[0]
          ? new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          : '05:58 PM';

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          pressure: Math.round(data.current.surface_pressure),
          condition: getCondition(data.current.weather_code),
          sunrise: sunriseTime,
          sunset: sunsetTime,
          daily: dailyForecast,
        });

        if (data.timezone) {
          setCoords((prev) => ({ ...prev, timezone: data.timezone }));
        }
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Reverse geocode coords to city/country
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
      );
      const data = await res.json();
      if (data && data.address) {
        setCoords((prev) => ({
          ...prev,
          city: data.address.city || data.address.town || data.address.county || 'Local Area',
          region: data.address.state || data.address.province || '',
          country: data.address.country || '',
        }));
      }
    } catch {
      // Fallback
    }
  };

  // Acquire Live GPS
  const acquireLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    soundFx.playScan();
    setLoadingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        soundFx.playChime();
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));

        setCoords((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : prev.altitude,
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          heading: pos.coords.heading || prev.heading,
        }));

        setGpsLocked(true);
        setLoadingGps(false);

        await reverseGeocode(lat, lon);
        await fetchWeatherForCoords(lat, lon);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLoadingGps(false);
        // Fallback to default
        fetchWeatherForCoords(coords.latitude, coords.longitude);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchWeatherForCoords(coords.latitude, coords.longitude);
  }, []);

  // Save location to Firebase Firestore
  const saveLocationToFirebase = async () => {
    soundFx.playClick();
    if (!auth.currentUser) {
      alert('Please sign in with Google to save location history to Firebase Firestore.');
      return;
    }

    try {
      const userLocRef = collection(db, `users/${auth.currentUser.uid}/locations`);
      await addDoc(userLocRef, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        city: coords.city,
        country: coords.country,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser.uid,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Save location error:', e);
    }
  };

  // Maps Grounding analysis with Gemini
  const askJarvisLocationAnalysis = async () => {
    soundFx.playScan();
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          prompt: `Perform a tactical location telemetry briefing for coordinates ${coords.latitude}, ${coords.longitude} in ${coords.city}, ${coords.country}. Include geographic terrain, weather implications, key regional infrastructure, and landmark bearings in J.A.R.V.I.S. voice.`,
        }),
      });
      const data = await res.json();
      soundFx.playChime();
      setAiAnalysis(data.text || 'Unable to retrieve location intelligence.');
    } catch (e: any) {
      setAiAnalysis(`Intelligence briefing error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="hud-card hud-corner-brackets rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 bg-[#051128] border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-cyan-400 bg-cyan-950/70 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_#00f0ff]">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-black text-cyan-200 tracking-wider flex items-center gap-2">
              <span>LIVE GEOLOCATION &amp; ATMOSPHERIC TELEMETRY</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                {gpsLocked ? 'GPS LOCKED' : 'GPS READY'}
              </span>
            </h1>
            <p className="text-xs font-tech text-cyan-400/80">
              Live orbital positioning, real-time local time zone, and meteorological radar updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={acquireLiveLocation}
            disabled={loadingGps}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingGps ? 'animate-spin' : ''}`} />
            <span>{loadingGps ? 'ACQUIRING SATELLITES...' : 'ACQUIRE LIVE GPS FIX'}</span>
          </button>

          <button
            onClick={saveLocationToFirebase}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cyan-400/60 bg-cyan-950/50 hover:bg-cyan-500/20 text-cyan-200 text-xs font-tech font-bold transition-all cursor-pointer"
            title="Save to Firestore"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{savedSuccess ? 'SAVED' : 'SAVE TO CLOUD'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: GPS Coordinates & Tactical Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Coordinates HUD Card */}
          <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e22] border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="font-tech font-bold text-sm">
                  {coords.city}, {coords.region} {coords.country && `(${coords.country})`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                ±{coords.accuracy}m ACCURACY
              </span>
            </div>

            {/* Tactical Coordinate Radar Canvas */}
            <div className="relative w-full h-44 rounded-xl border border-cyan-500/40 bg-[#020817] flex items-center justify-center overflow-hidden">
              {/* Radar Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Concentric Reticle Rings */}
              <div className="absolute w-36 h-36 rounded-full border border-cyan-400/30 animate-spin-slow" />
              <div className="absolute w-24 h-24 rounded-full border border-dashed border-cyan-400/50 animate-spin-reverse-slow" />
              <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-400/70" />

              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-cyan-500/30" />
                <div className="absolute h-full w-[1px] bg-cyan-500/30" />
              </div>

              {/* Target Indicator Ping */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-ping" />
                <span className="text-[10px] font-mono font-bold text-white bg-black/80 px-2 py-0.5 rounded mt-1 border border-cyan-400/60">
                  {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
                </span>
              </div>

              {/* Compass Cardinal Points */}
              <span className="absolute top-1 text-[9px] font-mono text-cyan-400/80">N</span>
              <span className="absolute bottom-1 text-[9px] font-mono text-cyan-400/80">S</span>
              <span className="absolute left-1 text-[9px] font-mono text-cyan-400/80">W</span>
              <span className="absolute right-1 text-[9px] font-mono text-cyan-400/80">E</span>
            </div>

            {/* Numeric Coordinates Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs font-tech">
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400">LATITUDE</div>
                <div className="font-mono text-base font-bold text-cyan-200">
                  {coords.latitude.toFixed(4)}°
                </div>
              </div>

              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400">LONGITUDE</div>
                <div className="font-mono text-base font-bold text-cyan-200">
                  {coords.longitude.toFixed(4)}°
                </div>
              </div>

              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400">ELEVATION (MSL)</div>
                <div className="font-mono text-xs font-bold text-cyan-300">
                  {coords.altitude ? `${coords.altitude} m` : '18 m'}
                </div>
              </div>

              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400">GROUND SPEED</div>
                <div className="font-mono text-xs font-bold text-cyan-300">
                  {coords.speed ? `${coords.speed} km/h` : '0 km/h (Stationary)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Live Time & Local Weather (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Real-time Time & Astronomical Solar Position */}
          <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e24] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_#00f0ff]">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-tech text-cyan-400 font-bold uppercase tracking-wider">
                  LOCAL ASTRONOMICAL TIME
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-cyan-100 tabular-nums drop-shadow-[0_0_10px_#00f0ff]">
                  {localTimeStr || '10:48:32 AM'}
                </div>
                <div className="text-xs font-tech text-slate-300">
                  {localDateStr} · <span className="text-cyan-400 font-mono">{coords.timezone}</span>
                </div>
              </div>
            </div>

            {weather && (
              <div className="flex items-center gap-4 text-xs font-tech border-l border-cyan-500/20 pl-4">
                <div className="flex items-center gap-2">
                  <Sunrise className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Dawn / Sunrise</div>
                    <div className="font-mono font-bold text-amber-300">{weather.sunrise}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Sunset className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Dusk / Sunset</div>
                    <div className="font-mono font-bold text-orange-300">{weather.sunset}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Meteorological Weather Telemetry Card */}
          <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#040e24] border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span className="font-tech font-bold text-sm">
                  LIVE WEATHER METRICS FOR {coords.city.toUpperCase()}
                </span>
              </div>
              {weatherLoading && (
                <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                  SYNCING BAROMETRIC SENSORS...
                </span>
              )}
            </div>

            {weather ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <CloudSun className="w-14 h-14 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
                    <div>
                      <div className="font-mono text-4xl font-black text-white tabular-nums">
                        {weather.temperature}°C
                      </div>
                      <div className="text-xs font-tech text-cyan-300 font-bold">
                        {weather.condition} · Feels like {weather.feelsLike}°C
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-tech">
                    <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-center">
                      <div className="text-[10px] text-slate-400">HUMIDITY</div>
                      <div className="font-mono font-bold text-cyan-200">{weather.humidity}%</div>
                    </div>
                    <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-center">
                      <div className="text-[10px] text-slate-400">WIND SPEED</div>
                      <div className="font-mono font-bold text-cyan-200">{weather.windSpeed} km/h</div>
                    </div>
                    <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/20 text-center">
                      <div className="text-[10px] text-slate-400">PRESSURE</div>
                      <div className="font-mono font-bold text-cyan-200">{weather.pressure} hPa</div>
                    </div>
                  </div>
                </div>

                {/* 5-Day Meteorological Forecast Strip */}
                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-cyan-500/20">
                  {weather.daily.map((d, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#030c1d] border border-cyan-500/20 text-center text-xs font-tech"
                    >
                      <div className="text-cyan-400 font-bold">{d.day}</div>
                      <div className="text-[10px] text-slate-300 truncate my-0.5">{d.condition}</div>
                      <div className="font-mono text-xs font-semibold text-white">
                        {d.max}° <span className="text-slate-500 text-[10px]">/{d.min}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-tech">
                Acquiring live meteorological radar feed...
              </div>
            )}
          </div>

          {/* AI Maps Grounding Intelligence Briefing */}
          <div className="hud-card hud-corner-brackets rounded-2xl p-4 bg-[#05142b] border border-cyan-400/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-tech font-bold text-xs">
                  J.A.R.V.I.S. GOOGLE MAPS GROUNDED INTELLIGENCE BRIEFING
                </span>
              </div>
              <button
                onClick={askJarvisLocationAnalysis}
                disabled={aiLoading}
                className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-[10px] font-tech font-bold transition-all cursor-pointer"
              >
                {aiLoading ? 'COMPUTING WITH MAPS...' : 'GENERATE BRIEFING'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="p-3 rounded-lg bg-[#030919] border border-cyan-500/20 text-xs font-tech text-cyan-100 leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-[11px] font-tech text-slate-400 italic">
                Click “GENERATE BRIEFING” to invoke Google Maps Grounding via Gemini for tactical analysis of your coordinates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
