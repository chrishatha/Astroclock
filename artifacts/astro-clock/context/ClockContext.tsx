import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  calculateSolarNoon,
  getCrossRotation,
  getMoonHandAngle,
  getSunAngle,
  getZodiacIndex,
  getZodiacRotation,
} from '@/utils/astronomy';

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface ClockValues {
  now: Date;
  location: Location;
  usingGPS: boolean;
  solarNoon: Date | null;
  solarNoonHour: number; // local decimal hour
  layer2RotationDeg: number;
  layer3RotationDeg: number;
  sunAngleDeg: number;
  moonHandAngleDeg: number;
  crossRotationDeg: number;
  zodiacCurrentIndex: number;
  zodiacPrevIndex: number;
  setLocation: (loc: Location) => void;
  setUsingGPS: (v: boolean) => void;
  refreshGPS: () => void;
}

const DEFAULT_LOCATION: Location = { latitude: 48.2, longitude: 16.37, name: 'Vienna' };

const ClockContext = createContext<ClockValues | null>(null);

function computeLayer2Rotation(now: Date, solarNoon: Date | null): number {
  // 24-hour wheel: current local hour at south (0°)
  // Hours 1-24 anticlockwise; hour H is at disc angle (H-1)*15° anticlockwise.
  // Rotation clockwise = (H - 1) * 15 brings H to south.
  let h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  if (h === 0) h = 24;
  return ((h - 1) * 15) % 360;
}

export function ClockProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(new Date());
  const [location, setLocationState] = useState<Location>(DEFAULT_LOCATION);
  const [usingGPS, setUsingGPSState] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Restore saved location
  useEffect(() => {
    AsyncStorage.getItem('clockLocation').then(val => {
      if (val) {
        try {
          const saved = JSON.parse(val) as { loc: Location; gps: boolean };
          setLocationState(saved.loc);
          setUsingGPSState(saved.gps);
        } catch {}
      }
      setLocationLoaded(true);
    });
  }, []);

  // Persist location changes
  useEffect(() => {
    if (!locationLoaded) return;
    AsyncStorage.setItem('clockLocation', JSON.stringify({ loc: location, gps: usingGPS }));
  }, [location, usingGPS, locationLoaded]);

  const setLocation = useCallback((loc: Location) => {
    setLocationState(loc);
  }, []);

  const setUsingGPS = useCallback((v: boolean) => {
    setUsingGPSState(v);
    if (v) refreshGPS();
  }, []);

  const refreshGPS = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setLocationState({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, name: 'GPS' }),
          () => {},
          { enableHighAccuracy: false, timeout: 10000 }
        );
      }
    } else {
      try {
        const Location = await import('expo-location');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocationState({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            name: 'GPS',
          });
        }
      } catch {}
    }
  }, []);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto GPS on mount if opted in
  useEffect(() => {
    if (locationLoaded && usingGPS) refreshGPS();
  }, [locationLoaded]);

  const solarNoon = calculateSolarNoon(now, location.latitude, location.longitude);
  const solarNoonHour = solarNoon.getHours() + solarNoon.getMinutes() / 60;

  const layer2RotationDeg = computeLayer2Rotation(now, solarNoon);
  const layer3RotationDeg = getZodiacRotation(now);
  const sunAngleDeg = getSunAngle(now);
  const moonHandAngleDeg = getMoonHandAngle(now);
  const crossRotationDeg = getCrossRotation(now.getFullYear(), now.getMonth());
  const zodiacCurrentIndex = getZodiacIndex(now);
  const zodiacPrevIndex = (zodiacCurrentIndex - 1 + 12) % 12;

  return (
    <ClockContext.Provider value={{
      now, location, usingGPS, solarNoon, solarNoonHour,
      layer2RotationDeg, layer3RotationDeg, sunAngleDeg,
      moonHandAngleDeg, crossRotationDeg, zodiacCurrentIndex, zodiacPrevIndex,
      setLocation, setUsingGPS, refreshGPS,
    }}>
      {children}
    </ClockContext.Provider>
  );
}

export function useClockContext(): ClockValues {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error('useClockContext must be used within ClockProvider');
  return ctx;
}
