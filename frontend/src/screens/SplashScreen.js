import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';

const PRIMARY = '#e23744';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    // Just show splash briefly, App.js handles auth routing
    const t = setTimeout(() => navigation.replace('AuthGate'), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1c1c" />
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.logo}><Text style={styles.logoTxt}>🍛</Text></View>
        <Text style={styles.name}>Swad Sadan</Text>
        <Text style={styles.hindi}>स्वाद सदन फैमिली रेस्टोरेंट</Text>
        <Text style={styles.loc}>Auraiya, Uttar Pradesh</Text>
        <View style={styles.badge}><Text style={styles.badgeTxt}>Pure Veg  •  ⭐ 5.0</Text></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logoTxt: { fontSize: 36 },
  name: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  hindi: { fontSize: 14, color: '#bbb', marginBottom: 8 },
  loc: { fontSize: 12, color: '#666', marginBottom: 16 },
  badge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeTxt: { color: '#aaa', fontSize: 12, fontWeight: '500' },
});
