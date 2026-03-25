import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#e23744';

export default function CompleteProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  
  const [phone, setPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState(user?.alternatePhone || '');
  const [address, setAddress] = useState(user?.address || '');
  
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const validate = () => {
    if (!phone.trim()) return 'Please enter your phone number';
    if (!/^\d{10}$/.test(phone.trim())) return 'Phone number must be 10 digits';
    if (!address.trim()) return 'Please enter your address';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setBusy(true);
    
    try {
      await updateProfile({ phone, alternatePhone: altPhone, address });
      // Go back to main app
      navigation.replace('MainTabs');
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View style={[styles.container, { opacity: fade }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>Hi {user?.name}, we need a few more details to deliver your food.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10 digit mobile number"
                placeholderTextColor="#ccc"
                value={phone}
                onChangeText={t => { setPhone(t); setError(''); }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Alternate Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Another number we can reach"
                placeholderTextColor="#ccc"
                value={altPhone}
                onChangeText={setAltPhone}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Delivery Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House No., Street, Landmark"
                placeholderTextColor="#ccc"
                value={address}
                onChangeText={t => { setAddress(t); setError(''); }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, busy && styles.btnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={busy}
            >
              <Text style={styles.btnTxt}>{busy ? 'Saving...' : 'Save & Continue'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },

  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#1c1c1c', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b6b6b', lineHeight: 20 },

  form: {},
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1c1c1c', marginBottom: 6 },
  input: {
    backgroundColor: '#f7f7f7', borderRadius: 12, paddingHorizontal: 16,
    height: 48, fontSize: 15, color: '#1c1c1c',
  },
  textArea: { height: 80, paddingTop: 14 },

  error: { color: PRIMARY, fontSize: 13, marginBottom: 16, textAlign: 'center' },

  btn: {
    backgroundColor: PRIMARY, borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
