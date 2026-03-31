import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Profile</Text>
          <Text style={styles.subtitle}>Manage your administrative account</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={44} color={PRIMARY} />
        </View>
        <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase() || 'ADMIN'}</Text>
        </View>
        {user?.branch && (
          <View style={[styles.badge, { backgroundColor: '#fdf2f2', marginTop: 10 }]}>
            <Ionicons name="location" size={12} color={PRIMARY} style={{marginRight: 4}} />
            <Text style={[styles.badgeText, { color: PRIMARY }]}>{user?.branch?.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{marginRight: 10}} />
        <Text style={styles.logoutText}>Secure Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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
  
  profileCard: { 
    margin: 20, 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 
  },
  avatar: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#fdf2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', marginBottom: 4, letterSpacing: -0.5 },
  email: { fontSize: 14, color: '#718096', marginBottom: 20, fontWeight: '500' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },

  logoutBtn: { 
    marginHorizontal: 20, 
    backgroundColor: PRIMARY, 
    height: 60, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 
  },
  logoutText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 }
});
