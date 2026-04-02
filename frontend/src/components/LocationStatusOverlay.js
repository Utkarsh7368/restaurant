import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#e23744';

export default function LocationStatusOverlay({ type, onShowModal }) {
  const navigation = useNavigation();

  if (type === 'no_address') {
    return (
      <View style={styles.overlay}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Where should we deliver?</Text>
        <Text style={styles.sub}>
          Set your delivery address to see the delicious menu available in your area.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MapScreen')}>
          <Text style={styles.btnTxt}>Set Delivery Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>We'll get here soon!</Text>
      <Text style={styles.sub}>
        Swad Sadan is currently delivering in Auraiya and Dibiyapur. Try switching your address to see the menu.
      </Text>
      <TouchableOpacity 
        style={[styles.btn, {backgroundColor: '#1a1a1a', marginBottom: 12}]} 
        onPress={onShowModal}
      >
        <Text style={styles.btnTxt}>Switch Saved Address</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MapScreen')}>
        <Text style={styles.btnTxt}>Change Location on Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: { fontSize: 80, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontWeight: '500' },
  btn: { backgroundColor: PRIMARY, paddingHorizontal: 24, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
