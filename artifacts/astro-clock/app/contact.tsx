import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMAIL = 'chris.hatha@proton.me';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  async function handleCopy() {
    await Clipboard.setStringAsync(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#06080f' }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: botPad + 20 }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#c9a227" />
        </TouchableOpacity>
        <Text style={styles.heading}>Contact</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.intro}>Get in touch with the developer of Astro-Clock-HaTha.</Text>

        <View style={styles.emailRow}>
          <Text style={styles.emailText}>{EMAIL}</Text>
          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <Text style={[styles.copyBtnText, copied && styles.copyBtnTextSuccess]}>
              {copied ? 'Copied! ✔' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.keyword}>
          Please use for request the keyword{'\n'}
          <Text style={styles.keywordHighlight}>Astro-Clock-Hatha</Text>
        </Text>
      </View>

      <Text style={styles.copyright}>© 2026 Christian Szeßny</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#0a1220',
    borderWidth: 1,
    borderColor: '#1e2d42',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e8d5a3',
    fontFamily: 'Inter_700Bold',
  },
  card: {
    backgroundColor: '#0a1220',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e2d42',
    gap: 16,
  },
  intro: {
    fontSize: 14,
    color: '#7a8a9a',
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#060c14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2d42',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  emailText: {
    flex: 1,
    fontSize: 15,
    color: '#c9a227',
    fontFamily: 'Inter_500Medium',
  },
  copyBtn: {
    backgroundColor: '#1e2d42',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  copyBtnSuccess: {
    backgroundColor: '#1a5a2a',
  },
  copyBtnText: {
    fontSize: 13,
    color: '#c9a227',
    fontFamily: 'Inter_600SemiBold',
  },
  copyBtnTextSuccess: {
    color: '#55ee77',
  },
  keyword: {
    fontSize: 13,
    color: '#5a6a7a',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  keywordHighlight: {
    color: '#c9a227',
    fontFamily: 'Inter_600SemiBold',
  },
  copyright: {
    fontSize: 12,
    color: '#3a4a5a',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
});
