import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth, API_URL } from '../../context/AuthContext';

const PRIMARY = '#e23744';

export default function SuperAdminRevenueScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenue = async () => {
    try {
      const res = await axios.get(`${API_URL}/superadmin/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.warn('Revenue fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenue();
  };

  const totalRevenue = stats.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Global Insights</Text>
        <Text style={styles.subtitle}>Daily revenue across all branches</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, { backgroundColor: PRIMARY }]}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryVal}>₹{totalRevenue}</Text>
          </View>
          <View style={[styles.summaryItem, { backgroundColor: '#1a1a1a' }]}>
            <Text style={styles.summaryLabel}>Delivered Today</Text>
            <Text style={styles.summaryVal}>{totalOrders}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Branch Breakdown</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.breakdownList}>
            {stats.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="bar-chart-outline" size={48} color="#ddd" />
                <Text style={styles.emptyTxt}>No revenue data for today yet</Text>
              </View>
            ) : (
              stats.map((item, idx) => (
                <View key={idx} style={styles.branchCard}>
                   <View style={styles.branchIcon}>
                     <Ionicons name="business" size={24} color={PRIMARY} />
                   </View>
                   <View style={{flex: 1}}>
                     <Text style={styles.branchName}>{item._id}</Text>
                     <Text style={styles.branchSub}>{item.count} Orders Delivered</Text>
                   </View>
                   <View style={styles.revenueBadge}>
                     <Text style={styles.revenueTxt}>₹{item.total}</Text>
                   </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Placeholder for Analytics Chart in future */}
        <View style={styles.analyticsTip}>
           <Ionicons name="bulb-outline" size={20} color="#718096" />
           <Text style={styles.tipTxt}>Pro Tip: Check which branch is peaking to optimize agent distribution!</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 24, fontWeight: '900', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600' },

  scroll: { padding: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  summaryItem: { flex: 1, padding: 20, borderRadius: 24, marginHorizontal: 5, elevation: 4 },
  summaryLabel: { color: '#fff', opacity: 0.8, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  summaryVal: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 8 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1a1a1a', marginBottom: 16 },
  breakdownList: { marginBottom: 30 },
  branchCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    marginBottom: 12,
    elevation: 1
  },
  branchIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  branchName: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  branchSub: { fontSize: 12, color: '#718096', marginTop: 2, fontWeight: '600' },
  revenueBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  revenueTxt: { color: '#10b981', fontWeight: '900', fontSize: 15 },

  empty: { padding: 40, alignItems: 'center' },
  emptyTxt: { marginTop: 10, color: '#cbd5e0', fontWeight: '600' },

  analyticsTip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#cbd5e0' },
  tipTxt: { flex: 1, marginLeft: 12, fontSize: 12, color: '#718096', fontWeight: '500', lineHeight: 18 }
});
