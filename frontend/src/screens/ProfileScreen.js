import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#e23744';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const ROWS = [
    { icon: '🛍️', label: 'My Orders', sub: 'Track and reorder meals', action: () => Alert.alert('Coming Soon', 'Order history will be available soon.') },
    { icon: '📍', label: 'Saved Addresses', sub: 'Home, work and more', action: () => navigation.navigate('CompleteProfile') },
    { icon: '❓', label: 'Help & Support', sub: 'Get help with orders', action: () => {} },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{user?.name?.[0]?.toUpperCase() || '👤'}</Text></View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest'} {user?.role === 'admin' ? '(Admin)' : user?.role === 'agent' ? '(Agent)' : ''}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Menu rows */}
        <View style={styles.menuCard}>
          {ROWS.map((r, i) => (
            <TouchableOpacity key={r.label} style={[styles.menuRow, i < ROWS.length-1 && styles.menuBorder]} activeOpacity={0.7} onPress={r.action}>
              <Text style={styles.menuIcon}>{r.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{r.label}</Text>
                <Text style={styles.menuSub}>{r.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Swad Sadan v2.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safe: { backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#1c1c1c', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  userCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fce8ea', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarTxt: { fontSize: 22, fontWeight: '800', color: PRIMARY },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', color: '#1c1c1c', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#aaa' },

  menuCard: { marginBottom: 20 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 20, marginRight: 14, width: 28, textAlign: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1c1c1c', marginBottom: 2 },
  menuSub: { fontSize: 12, color: '#aaa' },
  menuArrow: { fontSize: 20, color: '#ccc' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fef2f2', borderRadius: 12, paddingVertical: 14, marginBottom: 24,
  },
  logoutIcon: { fontSize: 18, marginRight: 8 },
  logoutTxt: { fontSize: 15, fontWeight: '700', color: PRIMARY },

  version: { fontSize: 11, color: '#ccc', textAlign: 'center' },
});
