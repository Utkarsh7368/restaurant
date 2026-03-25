import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function AdminOrdersScreen() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch admin orders', e);
    } finally {
      if (loading) fetchAgents(); // Fetch agents only once
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgents(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch agents', e);
    }
  };

  const assignAgent = async (orderId, agentId) => {
    const prevOrders = [...orders];
    // Optimistic: find agent name
    const agent = agents.find(a => a._id === agentId);
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, deliveryAgentId: agent, status: 'preparing' } : o));

    try {
      await axios.patch(`${API_URL}/admin/order/assign/${orderId}`, { agentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setOrders(prevOrders);
      Alert.alert('Error', 'Failed to assign agent');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const updateStatus = async (orderId, newStatus) => {
    const prevOrders = [...orders]; // For rollback
    
    // Optimistic Update: Change status locally immediately
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

    try {
      await axios.patch(`${API_URL}/admin/order/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally re-fetch to ensure sync, but the optimistic state is already correct
    } catch (e) {
      setOrders(prevOrders); // Rollback on error
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const cycleStatus = (currentStatus, orderId) => {
    if (currentStatus === 'pending') updateStatus(orderId, 'preparing');
    else if (currentStatus === 'preparing') updateStatus(orderId, 'delivered');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f39c12';
      case 'preparing': return '#3498db';
      case 'delivered': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    const prevOrders = [...orders];
    // Optimistic Update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o));

    try {
      await axios.patch(`${API_URL}/admin/order/payment/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setOrders(prevOrders); // Rollback
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const renderItem = ({ item }) => {
    const itemsString = item.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const customer = item.user || {};

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
          <View style={{flexDirection: 'row'}}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.status), marginRight: 6 }]}>
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.isPaid ? '#2ecc71' : '#e74c3c' }]}>
              <Text style={styles.badgeText}>{item.isPaid ? 'PAID' : 'UNPAID'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.items}>{itemsString}</Text>
        <View style={[styles.customerRow, {marginTop: 8}]}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={[styles.customerText, {fontWeight: '700'}]}>Payment: {item.paymentMethod || 'COD'}</Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.customerRow}>
          <Ionicons name="person-circle-outline" size={18} color="#666" />
          <Text style={styles.customerText}>{customer.name || 'Unknown'}</Text>
        </View>
        <View style={styles.customerRow}>
          <Ionicons name="call-outline" size={18} color="#666" />
          <Text style={styles.customerText}>{customer.phone || 'No phone'}</Text>
        </View>
        <View style={styles.customerRow}>
          <Ionicons name="location-outline" size={18} color="#666" />
          <Text style={styles.customerText}>{customer.address || 'No Picked Address'}</Text>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.agentSection}>
          <Text style={styles.sectionTitle}>Delivery Agent</Text>
          {item.deliveryAgentId ? (
            <View style={styles.assignedAgent}>
              <Ionicons name="bicycle" size={20} color={PRIMARY} />
              <Text style={styles.agentName}>{item.deliveryAgentId.name}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agentList}>
              {agents.length > 0 ? agents.map(agent => (
                <TouchableOpacity key={agent._id} style={styles.agentPill} onPress={() => assignAgent(item._id, agent._id)}>
                  <Text style={styles.agentPillText}>{agent.name}</Text>
                </TouchableOpacity>
              )) : <Text style={styles.noAgents}>No agents available</Text>}
            </ScrollView>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
          <View style={{flexDirection: 'row'}}>
            {!item.isPaid && (
              <TouchableOpacity 
                style={[styles.actionBtn, {backgroundColor: '#2ecc71', marginRight: 8}]}
                onPress={() => handleMarkAsPaid(item._id)}
              >
                <Text style={styles.actionBtnText}>Paid</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'delivered' && item.status !== 'cancelled' && (
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => cycleStatus(item.status, item._id)}
              >
                <Text style={styles.actionBtnText}>
                  {item.status === 'pending' ? 'Preparing' : 'Delivered'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Kitchen Orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  list: { padding: 16 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#1c1c1c' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  
  items: { fontSize: 15, color: '#444', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  
  customerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  customerText: { marginLeft: 8, fontSize: 13, color: '#555', flexShrink: 1 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { fontSize: 18, color: PRIMARY, fontWeight: '800' },
  actionBtn: { backgroundColor: '#1c1c1c', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#999', fontWeight: '600' },
  
  agentSection: { marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  assignedAgent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f8ff', padding: 10, borderRadius: 8 },
  agentName: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#2c3e50' },
  agentList: { flexDirection: 'row' },
  agentPill: { backgroundColor: '#f0f2f5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  agentPillText: { fontSize: 12, fontWeight: '600', color: '#555' },
  noAgents: { fontSize: 12, color: '#bbb', fontStyle: 'italic' }
});
