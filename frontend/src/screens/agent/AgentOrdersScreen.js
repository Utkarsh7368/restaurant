import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function AgentOrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignedOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/agent/assigned-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch assigned orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAssignedOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedOrders();
  };

  const markDelivered = async (orderId) => {
    const prevOrders = [...orders];
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'delivered', isDelivered: true } : o));

    try {
      await axios.patch(`${API_URL}/agent/order/deliver/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setOrders(prevOrders);
      Alert.alert('Error', 'Failed to update delivery status');
    }
  };

  const markPaid = async (orderId) => {
    const prevOrders = [...orders];
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o));

    try {
      await axios.patch(`${API_URL}/agent/order/pay/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setOrders(prevOrders);
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const openMaps = (address) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`
    });
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open maps'));
  };

  const renderItem = ({ item }) => {
    const customer = item.user || {};
    const itemsString = item.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
          <View style={{flexDirection: 'row'}}>
            {item.isPaid ? (
              <View style={[styles.badge, { backgroundColor: '#2ecc71', marginRight: 6 }]}>
                <Text style={styles.badgeText}>PAID</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: '#e74c3c', marginRight: 6 }]}>
                <Text style={styles.badgeText}>UNPAID</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: item.status === 'delivered' ? '#2ecc71' : '#3498db' }]}>
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.items}>{itemsString}</Text>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{customer.name}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
            <Text style={[styles.infoText, {color: PRIMARY, fontWeight: '700'}]}>{customer.phone}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{customer.address}</Text>
        </View>

        <TouchableOpacity style={styles.mapsBtn} onPress={() => openMaps(customer.address)}>
          <Ionicons name="map-outline" size={18} color="#fff" />
          <Text style={styles.mapsBtnText}>Navigate to Customer</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.actions}>
          {!item.isPaid && (
            <TouchableOpacity style={styles.payBtn} onPress={() => markPaid(item._id)}>
              <Text style={styles.actionBtnText}>Mark Paid</Text>
            </TouchableOpacity>
          )}
          {item.status !== 'delivered' && (
            <TouchableOpacity style={styles.deliverBtn} onPress={() => markDelivered(item._id)}>
              <Text style={styles.actionBtnText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="bicycle-outline" size={80} color="#eee" />
            <Text style={styles.emptyText}>No assigned orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#1c1c1c' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  items: { fontSize: 14, color: '#444', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  infoText: { marginLeft: 10, fontSize: 14, color: '#555', flex: 1 },
  mapsBtn: { backgroundColor: '#1c1c1c', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, marginTop: 8 },
  mapsBtnText: { color: '#fff', marginLeft: 8, fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  payBtn: { flex: 1, backgroundColor: '#f39c12', padding: 12, borderRadius: 10, alignItems: 'center' },
  deliverBtn: { flex: 1, backgroundColor: '#2ecc71', padding: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#999', fontWeight: '600' }
});
