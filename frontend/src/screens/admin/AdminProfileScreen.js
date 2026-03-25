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
        <Text style={styles.title}>Admin Settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={40} color={PRIMARY} />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SUPER ADMIN</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{marginRight: 8}} />
        <Text style={styles.logoutText}>Secure Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  
  profileCard: { margin: 20, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '800', color: '#1c1c1c', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  badge: { backgroundColor: '#1c1c1c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  logoutBtn: { marginHorizontal: 20, backgroundColor: PRIMARY, height: 54, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
