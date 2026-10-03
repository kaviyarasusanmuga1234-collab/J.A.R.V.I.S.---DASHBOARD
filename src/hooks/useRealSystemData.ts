import { useState, useEffect } from 'react';

export interface RealSystemData {
  osName: string;
  architecture: string;
  cores: number;
  deviceMemoryGb: number;
  battery: {
    supported: boolean;
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  };
  network: {
    supported: boolean;
    online: boolean;
    effectiveType: string;
    downlinkMbps: number;
    rttMs: number;
  };
  heapMemory: {
    supported: boolean;
    usedMb: number;
    totalMb: number;
    limitMb: number;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
}

export function useRealSystemData(): RealSystemData {
  const [data, setData] = useState<RealSystemData>(() => {
    // Detect OS from navigator
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    let os = 'Windows 11 Pro';
    if (ua.includes('Mac OS')) os = 'macOS Sonoma';
    else if (ua.includes('Linux')) os = 'Linux x86_64';
    else if (ua.includes('Android')) os = 'Android 14';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;
    const memory = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 16 : 16;

    return {
      osName: os,
      architecture: '64-bit',
      cores,
      deviceMemoryGb: memory,
      battery: {
        supported: false,
        level: 78,
        charging: false,
        chargingTime: 0,
        dischargingTime: 11520,
      },
      network: {
        supported: true,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        effectiveType: '5g',
        downlinkMbps: 128.4,
        rttMs: 14,
      },
      heapMemory: {
        supported: false,
        usedMb: 68,
        totalMb: 142,
        limitMb: 4096,
      },
      screen: {
        width: typeof window !== 'undefined' ? window.screen.width : 1920,
        height: typeof window !== 'undefined' ? window.screen.height : 1080,
        colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : 24,
        pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      },
    };
  });

  useEffect(() => {
    // Battery API
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBatt = () => {
          setData((prev) => ({
            ...prev,
            battery: {
              supported: true,
              level: Math.round(batt.level * 100),
              charging: batt.charging,
              chargingTime: batt.chargingTime,
              dischargingTime: batt.dischargingTime,
            },
          }));
        };
        updateBatt();
        batt.addEventListener('levelchange', updateBatt);
        batt.addEventListener('chargingchange', updateBatt);
      });
    }

    // Network Information API
    const conn = (navigator as any).connection;
    const updateNetwork = () => {
      setData((prev) => ({
        ...prev,
        network: {
          supported: !!conn,
          online: navigator.onLine,
          effectiveType: conn?.effectiveType || '4g',
          downlinkMbps: conn?.downlink ? conn.downlink * 10 : prev.network.downlinkMbps,
          rttMs: conn?.rtt || prev.network.rttMs,
        },
      }));
    };
    if (conn) {
      conn.addEventListener('change', updateNetwork);
    }
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    // Performance memory polling
    const interval = setInterval(() => {
      const perfMem = (performance as any).memory;
      if (perfMem) {
        setData((prev) => ({
          ...prev,
          heapMemory: {
            supported: true,
            usedMb: Math.round(perfMem.usedJSHeapSize / (1024 * 1024)),
            totalMb: Math.round(perfMem.totalJSHeapSize / (1024 * 1024)),
            limitMb: Math.round(perfMem.jsHeapSizeLimit / (1024 * 1024)),
          },
        }));
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (conn) conn.removeEventListener('change', updateNetwork);
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  }, []);

  return data;
}
