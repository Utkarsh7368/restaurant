import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const PRIMARY = '#e23744';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name';
    if (!email.trim()) return 'Please enter your email';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Please enter a valid email';
    if (!password) return 'Please enter a password';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setBusy(true);
    try {
      await register(name, email, password);
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
            <View style={styles.logo}><Text style={styles.logoTxt}>🍛</Text></View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Swad Sadan</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={t => { setName(t); setError(''); }}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, busy && styles.btnDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={busy}
            >
              <Text style={styles.btnTxt}>{busy ? 'Creating account...' : 'Register'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign In</Text>
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

  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoTxt: { fontSize: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b6b6b' },

  form: {},
  inputWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#1c1c1c', marginBottom: 6 },
  input: {
    backgroundColor: '#f7f7f7', borderRadius: 12, paddingHorizontal: 16,
    height: 48, fontSize: 15, color: '#1c1c1c',
  },

  error: { color: PRIMARY, fontSize: 13, marginBottom: 12, textAlign: 'center' },

  btn: {
    backgroundColor: PRIMARY, borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerTxt: { fontSize: 14, color: '#6b6b6b' },
  footerLink: { fontSize: 14, fontWeight: '700', color: PRIMARY },
});
