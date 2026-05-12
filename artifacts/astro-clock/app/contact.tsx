import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return 'http://localhost:5000';
}

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!senderEmail.trim() || !message.trim()) {
      Alert.alert('Required', 'Please fill in both your email address and your message.');
      return;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(senderEmail.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${getApiBase()}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderEmail: senderEmail.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error('Server error');
      setSent(true);
    } catch {
      Alert.alert('Error', 'Could not send your message. Please try again later.');
    } finally {
      setSending(false);
    }
  }

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

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
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#c9a227" />
          </TouchableOpacity>
          <Text style={styles.heading}>Contact</Text>
        </View>

        {sent ? (
          <View style={styles.successCard}>
            <Feather name="check-circle" size={48} color="#c9a227" />
            <Text style={styles.successTitle}>Message sent!</Text>
            <Text style={styles.successText}>
              Thank you for reaching out. Your message has been delivered.
            </Text>
            <TouchableOpacity style={styles.sendBtn} onPress={() => router.back()}>
              <Text style={styles.sendBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.intro}>
              Have a question or feedback about Astro Clock? Write a message below.
            </Text>

            <Text style={styles.inputLabel}>Your email address</Text>
            <TextInput
              style={styles.input}
              value={senderEmail}
              onChangeText={setSenderEmail}
              placeholder="you@example.com"
              placeholderTextColor="#3a4a5a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={styles.inputLabel}>Your message</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message here…"
              placeholderTextColor="#3a4a5a"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#06080f" size="small" />
              ) : (
                <Text style={styles.sendBtnText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Copyright */}
        <Text style={styles.copyright}>© 2026 Christian Szeßny</Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e2d42',
    gap: 12,
  },
  intro: {
    fontSize: 14,
    color: '#7a8a9a',
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#5a6a7a',
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: -4,
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
  textarea: {
    minHeight: 130,
    paddingTop: 12,
  },
  sendBtn: {
    backgroundColor: '#c9a227',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06080f',
    fontFamily: 'Inter_700Bold',
  },
  successCard: {
    backgroundColor: '#0a1220',
    borderRadius: 14,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1e2d42',
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#c9a227',
    fontFamily: 'Inter_700Bold',
  },
  successText: {
    fontSize: 14,
    color: '#7a8a9a',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  copyright: {
    fontSize: 12,
    color: '#3a4a5a',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
});
