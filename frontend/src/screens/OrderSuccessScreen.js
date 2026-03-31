import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBranch } from '../context/BranchContext';

const PRIMARY = '#e23744';

export default function OrderSuccessScreen({ route }) {
  const { orderId } = route.params || { orderId: 'UNKNOWN' };
  const navigation = useNavigation();
  const { selectedBranch, BRANCHES } = useBranch();
  const branchName = BRANCHES.find(b => b.id === selectedBranch)?.name || 'Swad Sadan';
  
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
          <Ionicons name="checkmark-circle" size={80} color="#10b981" />
        </View>
        
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>Your delicious meal is being prepared with care and love.</Text>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.val}>#{orderId.substring(orderId.length - 6).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Est. Delivery Time</Text>
            <View style={styles.etaBox}>
              <Ionicons name="time-outline" size={14} color="#059669" style={{marginRight: 4}} />
              <Text style={styles.valHighlight}>{eta} mins</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Preparing at</Text>
            <Text style={styles.val}>{branchName}</Text>
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
  container: { flex: 1, backgroundColor: '#fcfcfc', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 30, flex: 1, justifyContent: 'center' },
  
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 30, shadowColor: '#10b981', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  
  title: { fontSize: 28, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 40, lineHeight: 22, fontWeight: '500' },
  
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  val: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
  etaBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  valHighlight: { fontSize: 16, fontWeight: '900', color: '#059669' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },

  footer: { paddingHorizontal: 30, paddingBottom: 20 },
  btn: { 
    backgroundColor: PRIMARY, 
    height: 60, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 
  },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
