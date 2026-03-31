import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const ROWS = [
    { icon: 'receipt-outline', label: 'My Orders', sub: 'View order history', color: '#3b82f6', bg: '#eff6ff', action: () => navigation.navigate('Orders') },
    { icon: 'location-outline', label: 'My Addresses', sub: 'Saved delivery spots', color: '#10b981', bg: '#ecfdf5', action: () => navigation.navigate('MyAddresses') },
    { icon: 'card-outline', label: 'Payments', sub: 'Manage payment methods', color: '#f59e0b', bg: '#fffbeb', action: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', sub: 'Offers and updates', color: '#8b5cf6', bg: '#f5f3ff', action: () => {} },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <View>
          <Text style={styles.title}>My Account</Text>
          <Text style={styles.subtitle}>Manage your orders and preferences</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{user?.name?.[0]?.toUpperCase() || '👤'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Set up your profile'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CompleteProfile')}>
            <Ionicons name="pencil" size={16} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Menu Grid / List */}
        <View style={styles.menuContainer}>
          {ROWS.map((r, i) => (
            <TouchableOpacity key={r.label} style={styles.menuRow} activeOpacity={0.7} onPress={r.action}>
              <View style={[styles.iconBox, {backgroundColor: r.bg || '#f8fafc'}]}>
                <Ionicons name={r.icon} size={20} color={r.color || '#4a5568'} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{r.label}</Text>
                <Text style={styles.menuSub}>{r.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e0" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Card */}
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <Ionicons name="help-circle-outline" size={20} color="#718096" />
            <Text style={styles.supportTitle}>Need help?</Text>
          </View>
          <Text style={styles.supportDesc}>Contact our support team for any issues with your orders or account.</Text>
          <TouchableOpacity style={styles.supportBtn}>
            <Text style={styles.supportBtnTxt}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={{marginRight: 10}} />
          <Text style={styles.logoutTxt}>Sign Out Securely</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Swad Sadan App • v2.1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 2 },
  
  scroll: { paddingBottom: 40 },

  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3
  },
  avatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarTxt: { fontSize: 24, fontWeight: '900', color: PRIMARY },
  userInfo: { flex: 1 },
  userName: { fontSize: 19, fontWeight: '900', color: '#1a1a1a', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#a0aec0', fontWeight: '500' },
  editBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center' },

  menuContainer: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#fff', borderRadius: 24, padding: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '900', color: '#2d3748', marginBottom: 1 },
  menuSub: { fontSize: 12, color: '#a0aec0', fontWeight: '500' },

  supportCard: { marginHorizontal: 20, marginBottom: 30, backgroundColor: '#f8fafc', padding: 20, borderRadius: 24 },
  supportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  supportTitle: { fontSize: 14, fontWeight: '900', color: '#4a5568', marginLeft: 8 },
  supportDesc: { fontSize: 12, color: '#718096', lineHeight: 18, marginBottom: 15, fontWeight: '500' },
  supportBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  supportBtnTxt: { fontSize: 12, fontWeight: '800', color: '#4a5568' },

  logoutBtn: {
    marginHorizontal: 20,
    backgroundColor: PRIMARY,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
    marginBottom: 20
  },
  logoutTxt: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  version: { fontSize: 11, color: '#cbd5e0', textAlign: 'center', fontWeight: '600', letterSpacing: 1 },
});
