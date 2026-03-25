import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';

const PRIMARY = '#e23744';

export default function OrderSuccessScreen({ route }) {
  const { orderId } = route.params || { orderId: 'UNKNOWN' };
  const navigation = useNavigation();
  
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  
  // Random ETA between 25 and 40 mins
  const eta = useRef(Math.floor(Math.random() * (40 - 25 + 1)) + 25).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleHome = () => {
    // Navigate back to the main app dashboard
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconTxt}>✅</Text>
        </View>
        
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>Your food is being prepared with love.</Text>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.val}>#{orderId.substring(orderId.length - 6).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Delivery</Text>
            <Text style={styles.valHighlight}>{eta} mins</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleHome} activeOpacity={0.85}>
          <Text style={styles.btnTxt}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 30, flex: 1, justifyContent: 'center' },
  
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e8fbe8', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconTxt: { fontSize: 40 },
  
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b6b6b', textAlign: 'center', marginBottom: 32 },
  
  card: { width: '100%', backgroundColor: '#fcfcfc', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f0f0f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: '#6b6b6b' },
  val: { fontSize: 15, fontWeight: '700', color: '#1c1c1c' },
  valHighlight: { fontSize: 15, fontWeight: '800', color: '#27ae60' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },

  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  btn: { backgroundColor: PRIMARY, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
