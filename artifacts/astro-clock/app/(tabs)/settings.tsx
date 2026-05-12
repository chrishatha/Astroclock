import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClockContext } from '@/context/ClockContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { location, usingGPS, setLocation, setUsingGPS, refreshGPS } = useClockContext();

  const [latInput, setLatInput] = useState(String(location.latitude));
  const [lngInput, setLngInput] = useState(String(location.longitude));
  const [nameInput, setNameInput] = useState(location.name);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleGPSToggle(value: boolean) {
    if (value) {
      setLoading(true);
      setUsingGPS(true);
      try {
        await new Promise(r => setTimeout(r, 1500));
      } finally {
        setLoading(false);
      }
    } else {
      setUsingGPS(false);
    }
  }

  function handleSave() {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert('Invalid latitude', 'Latitude must be between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert('Invalid longitude', 'Longitude must be between -180 and 180.');
      return;
    }
    setLocation({ latitude: lat, longitude: lng, name: nameInput.trim() || 'Custom' });
    setUsingGPS(false);
    Alert.alert('Saved', 'Location updated successfully.');
  }

  const PRESETS = [
    { name: 'Vienna',    lat: 48.21, lng: 16.37 },
    { name: 'Berlin',   lat: 52.52, lng: 13.40 },
    { name: 'London',   lat: 51.51, lng: -0.13 },
    { name: 'New York', lat: 40.71, lng: -74.01 },
    { name: 'Tokyo',    lat: 35.68, lng: 139.69 },
    { name: 'Sydney',   lat: -33.87, lng: 151.21 },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#06080f' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: botPad + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Settings</Text>
        <Text style={styles.subheading}>Location for solar noon calculation</Text>

        {/* GPS Toggle */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="map-pin" size={18} color="#c9a227" />
              <Text style={styles.label}>Use GPS Location</Text>
            </View>
            <View style={styles.rowRight}>
              {loading && <ActivityIndicator size="small" color="#c9a227" style={{ marginRight: 8 }} />}
              <Switch
                value={usingGPS}
                onValueChange={handleGPSToggle}
                trackColor={{ false: '#1e2d42', true: '#6a5010' }}
                thumbColor={usingGPS ? '#c9a227' : '#4a5a6a'}
              />
            </View>
          </View>
          {usingGPS && (
            <TouchableOpacity style={styles.refreshBtn} onPress={() => { setLoading(true); refreshGPS(); setTimeout(() => setLoading(false), 1500); }}>
              <Feather name="refresh-cw" size={14} color="#c9a227" />
              <Text style={styles.refreshText}>Refresh GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Manual location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manual Location</Text>

          <Text style={styles.inputLabel}>Location Name</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="e.g. Vienna"
            placeholderTextColor="#3a4a5a"
            keyboardType="default"
          />

          <Text style={styles.inputLabel}>Latitude (–90 to 90)</Text>
          <TextInput
            style={styles.input}
            value={latInput}
            onChangeText={setLatInput}
            placeholder="48.21"
            placeholderTextColor="#3a4a5a"
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Longitude (–180 to 180)</Text>
          <TextInput
            style={styles.input}
            value={lngInput}
            onChangeText={setLngInput}
            placeholder="16.37"
            placeholderTextColor="#3a4a5a"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Location</Text>
          </TouchableOpacity>
        </View>

        {/* Presets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Presets</Text>
          <View style={styles.presetGrid}>
            {PRESETS.map(p => (
              <TouchableOpacity
                key={p.name}
                style={[styles.preset, location.name === p.name && styles.presetActive]}
                onPress={() => {
                  setLatInput(String(p.lat));
                  setLngInput(String(p.lng));
                  setNameInput(p.name);
                  setLocation({ latitude: p.lat, longitude: p.lng, name: p.name });
                  setUsingGPS(false);
                }}
              >
                <Text style={[styles.presetText, location.name === p.name && styles.presetTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About the Clock</Text>
          <Text style={styles.info}>
            {'Layer 1 – Fixed degree ring (30 fields × 12°, south = 0°)\n' +
             'Layer 2 – 24-hour wheel (current hour at south)\n' +
             'Layer 3 – Zodiac ring (rotates monthly)\n' +
             'Layer 4 – Sun hand (1°/day from spring equinox)\n' +
             'Layer 5 – Moon hand (synodic cycle pattern)\n' +
             'Layer 6 – Lunar phase cross (aligned to month phases)'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e8d5a3',
    fontFamily: 'Inter_700Bold',
  },
  subheading: {
    fontSize: 13,
    color: '#5a6a7a',
    fontFamily: 'Inter_400Regular',
    marginTop: -10,
  },
  card: {
    backgroundColor: '#0a1220',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e2d42',
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c9a227',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: '#e8d5a3',
    fontFamily: 'Inter_500Medium',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c9a227',
    alignSelf: 'flex-start',
  },
  refreshText: {
    fontSize: 13,
    color: '#c9a227',
    fontFamily: 'Inter_500Medium',
  },
  inputLabel: {
    fontSize: 12,
    color: '#5a6a7a',
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: -6,
  },
  input: {
    backgroundColor: '#060c14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2d42',
    color: '#e8d5a3',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  saveBtn: {
    backgroundColor: '#c9a227',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#06080f',
    fontFamily: 'Inter_700Bold',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2d42',
    backgroundColor: '#060c14',
  },
  presetActive: {
    borderColor: '#c9a227',
    backgroundColor: '#1a1400',
  },
  presetText: {
    fontSize: 14,
    color: '#7a8a9a',
    fontFamily: 'Inter_500Medium',
  },
  presetTextActive: {
    color: '#c9a227',
  },
  info: {
    fontSize: 13,
    color: '#5a6a7a',
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
});
