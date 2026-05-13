import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ClockFace from '@/components/ClockFace';
import { useClockContext } from '@/context/ClockContext';

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatSolarNoon(date: Date | null): string {
  if (!date) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ClockScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    now, solarNoon, location,
    layer2RotationDeg, layer3RotationDeg,
    sunAngleDeg, moonHandAngleDeg, crossRotationDeg,
    zodiacCurrentIndex, zodiacPrevIndex,
    fullMoonDay, firstQuarterDay, newMoonDay, lastQuarterDay,
  } = useClockContext();

  const { width } = Dimensions.get('window');
  const clockSize = Math.min(width - 16, 520);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad + 8, paddingBottom: botPad + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.timeText}>{formatTime(now)}</Text>
          <Text style={styles.dateText}>
            {now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings')}
          style={styles.settingsBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="settings" size={22} color="#c9a227" />
        </TouchableOpacity>
      </View>

      {/* Clock */}
      <View style={styles.clockContainer}>
        <ClockFace
          size={clockSize}
          layer2RotationDeg={layer2RotationDeg}
          layer3RotationDeg={layer3RotationDeg}
          sunAngleDeg={sunAngleDeg}
          moonHandAngleDeg={moonHandAngleDeg}
          crossRotationDeg={crossRotationDeg}
          zodiacCurrentIndex={zodiacCurrentIndex}
          zodiacPrevIndex={zodiacPrevIndex}
          fullMoonDay={fullMoonDay}
          firstQuarterDay={firstQuarterDay}
          newMoonDay={newMoonDay}
          lastQuarterDay={lastQuarterDay}
        />
      </View>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Solar Noon</Text>
            <Text style={styles.infoValue}>{formatSolarNoon(solarNoon)}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{location.name}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Lat / Lon</Text>
            <Text style={styles.infoValue}>
              {location.latitude.toFixed(2)}° / {location.longitude.toFixed(2)}°
            </Text>
          </View>
        </View>
        <View style={styles.infoSep} />
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🌕 Full Moon</Text>
            <Text style={styles.infoValue}>
              {fullMoonDay != null
                ? `${String(fullMoonDay).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.`
                : '--'}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🌑 New Moon</Text>
            <Text style={styles.infoValue}>
              {newMoonDay != null
                ? `${String(newMoonDay).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.`
                : '--'}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🌗 Last Quarter</Text>
            <Text style={styles.infoValue}>
              {lastQuarterDay != null
                ? `${String(lastQuarterDay).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.`
                : '--'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080f',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  headerLeft: {
    gap: 2,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e8d5a3',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#7a8a9a',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 1,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#0f1a28',
    borderWidth: 1,
    borderColor: '#1e2d42',
  },
  clockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBar: {
    backgroundColor: '#0a1220',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1e2d42',
    width: '92%',
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  infoSep: {
    height: 1,
    backgroundColor: '#1e2d42',
    marginHorizontal: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoLabel: {
    fontSize: 9,
    color: '#5a6a7a',
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 12,
    color: '#c9a227',
    fontFamily: 'Inter_600SemiBold',
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#1e2d42',
  },
});
