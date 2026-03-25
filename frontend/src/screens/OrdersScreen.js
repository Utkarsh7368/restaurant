import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/user/${user.id}`);
      setOrders(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f39c12'; // Orange
      case 'preparing': return '#3498db'; // Blue
      case 'delivered': return '#2ecc71'; // Green
      default: return '#95a5a6';
    }
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const itemsString = item.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.date}>{date}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.items} numberOfLines={2}>{itemsString}</Text>
        
        <View style={styles.divider} />
        
        {item.deliveryAgentId && (
          <View style={styles.agentInfo}>
            <Ionicons name="bicycle" size={16} color={PRIMARY} />
            <Text style={styles.agentText}>Assigned: {item.deliveryAgentId.name}</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' },
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  
  list: { padding: 16 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#1c1c1c' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  
  date: { fontSize: 13, color: '#999', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  
  items: { fontSize: 14, color: '#444', lineHeight: 20 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  totalValue: { fontSize: 18, color: PRIMARY, fontWeight: '800' },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 22 },
  agentInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f8ff', padding: 8, borderRadius: 8 },
  agentText: { marginLeft: 8, fontSize: 13, fontWeight: '700', color: '#2c3e50' }
});
