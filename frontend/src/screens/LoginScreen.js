import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useAuth } from '../context/AuthContext';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const PRIMARY = '#e23744';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    
    // Initialize Google Sign-in (ONLY if not in Expo Go)
    if (!isExpoGo) {
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
          webClientId: '345450378654-ivc1j9dc1okifs50jb9muki6g5pf8rou.apps.googleusercontent.com',
        });
      } catch (e) {
        console.warn('Google Sign-In initialization failed.');
      }
    }
  }, []);

  const { login, googleLogin } = useAuth();

  const validate = () => {
    if (!email.trim()) return 'Please enter your email';
    if (password.length < 4) return 'Password is too short';
    return null;
  };

  const handleLogin = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const handleGoogleLogin = async () => {
    if (isExpoGo) {
      Alert.alert(
        "Google Sign-In Unavailable",
        "This feature requires native code and only works in your actual APK, not in Expo Go. Please use your EAS Build to test this!"
      );
      return;
    }

    try {
      setBusy(true);
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data.idToken) {
        await googleLogin(userInfo.data.idToken);
      }
    } catch (e) {
      console.log('Google Error:', e);
      Alert.alert(
        "Google Sign-In Error",
        "There was a problem signing in with Google. Please ensure you are using the installed app (not Expo Go) and that your Google Cloud Console is configured correctly."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Animated.View style={[styles.container, { opacity: fade }]}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoTxt}>🍛</Text></View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to Swad Sadan</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passInputWrap}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="••••••••"
                  placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeBtn} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, busy && styles.btnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={busy}
            >
              <Text style={styles.btnTxt}>{busy ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <View style={styles.dividerWrap}>
              <View style={styles.line} />
              <Text style={styles.dividerTxt}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, busy && styles.btnDisabled]}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
              disabled={busy}
            >
              <Ionicons name="logo-google" size={18} color="#444" style={{marginRight: 10}} />
              <Text style={styles.googleBtnTxt}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTxt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register</Text>
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
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 60 },

  header: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoTxt: { fontSize: 28 },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b6b6b' },

  form: {},
  inputWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1c1c1c', marginBottom: 6 },
  input: {
    backgroundColor: '#f7f7f7', borderRadius: 12, paddingHorizontal: 16,
    height: 48, fontSize: 15, color: '#1c1c1c',
  },
  inputFlex: {
    flex: 1, paddingHorizontal: 16, height: '100%', fontSize: 15, color: '#1c1c1c',
  },
  passInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7f7f7', borderRadius: 12, height: 48,
  },
  eyeBtn: { paddingRight: 16, height: '100%', justifyContent: 'center' },

  error: { color: PRIMARY, fontSize: 13, marginBottom: 12, textAlign: 'center' },

  btn: {
    backgroundColor: PRIMARY, borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  dividerWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerTxt: { marginHorizontal: 12, fontSize: 12, color: '#999', fontWeight: '600' },

  googleBtn: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, height: 48,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee',
  },
  googleBtnTxt: { color: '#444', fontSize: 15, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerTxt: { fontSize: 14, color: '#6b6b6b' },
  footerLink: { fontSize: 14, fontWeight: '700', color: PRIMARY },
});
