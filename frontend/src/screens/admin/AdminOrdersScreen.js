import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, ScrollView } from 'react-native';
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
  const [filterBranch, setFilterBranch] = useState(user?.role === 'superadmin' ? 'All' : user?.branch);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/orders`, {
        params: { branch: filterBranch },
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
    }, [token, filterBranch])
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
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o));

    try {
      await axios.patch(`${API_URL}/admin/order/payment/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      setOrders(prevOrders);
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'New Order', color: '#f59e0b', bg: '#fef3c7' };
      case 'preparing': return { label: 'Preparing', color: '#3b82f6', bg: '#dbeafe' };
      case 'delivered': return { label: 'Completed', color: '#10b981', bg: '#d1fae5' };
      case 'cancelled': return { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' };
      default: return { label: status.toUpperCase(), color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const renderItem = ({ item }) => {
    const itemsString = item.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const customer = item.user || {};
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.branchTag}>
          <Ionicons name="location" size={12} color="#718096" />
          <Text style={styles.branchTagText}>{item.branch || 'Auraiya'}</Text>
        </View>

        <View style={styles.itemsBox}>
          <Text style={styles.items}>{itemsString}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={14} color="#a0aec0" />
          <Text style={styles.sectionTitle}>Customer Details</Text>
        </View>
        
        <View style={styles.customerContent}>
          <Text style={styles.custName}>{customer.name || 'Walk-in Customer'}</Text>
          <View style={styles.custDetailRow}>
            <Ionicons name="call-outline" size={14} color="#718096" />
            <Text style={styles.custDetailText}>{customer.phone || 'Contact not provided'}</Text>
          </View>
          <View style={styles.custDetailRow}>
            <Ionicons name="location-outline" size={14} color="#718096" />
            <Text style={styles.custDetailText} numberOfLines={2}>{customer.address || 'Dining In'}</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Ionicons name="bicycle-outline" size={14} color="#a0aec0" />
          <Text style={styles.sectionTitle}>Delivery Agent</Text>
        </View>

        <View style={styles.agentBox}>
          {item.deliveryAgentId ? (
            <View style={styles.assignedAgent}>
              <View style={styles.agentAvatar}>
                <Ionicons name="bicycle" size={16} color={PRIMARY} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.agentName}>{item.deliveryAgentId.name}</Text>
                <Text style={styles.agentRole}>ID: {item.deliveryAgentId.agentId}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
          ) : (
            user?.role === 'admin' ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agentScroll}>
                {agents.length > 0 ? agents.map(agent => (
                  <TouchableOpacity key={agent._id} style={styles.agentChip} onPress={() => assignAgent(item._id, agent._id)} activeOpacity={0.7}>
                    <Text style={styles.agentChipText}>{agent.name}</Text>
                  </TouchableOpacity>
                )) : <Text style={styles.noAgents}>Wait for agents to go online...</Text>}
              </ScrollView>
            ) : (
              <View style={styles.unassignedAgent}>
                <Ionicons name="help-circle-outline" size={16} color="#a0aec0" />
                <Text style={styles.unassignedText}>Not yet assigned to any agent</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.cardActions}>
          {/* Payment Status Badge (Replaced button with status indicator) */}
          <View style={[styles.inlineStatus, { backgroundColor: item.isPaid ? '#ecfdf5' : '#fff5f5' }]}>
            <Ionicons name={item.isPaid ? "cash-outline" : "warning-outline"} size={16} color={item.isPaid ? "#10b981" : "#ef4444"} />
            <Text style={[styles.inlineStatusText, { color: item.isPaid ? "#10b981" : "#ef4444" }]}>
              {item.isPaid ? 'PAID' : 'NOT PAID'}
            </Text>
          </View>

          {/* Action Button: Only visible to Admins (not Superadmins) and only if not delivered/cancelled */}
          {user?.role === 'admin' && item.status === 'pending' && (
            <TouchableOpacity 
              style={styles.nextBtn}
              onPress={() => updateStatus(item._id, 'preparing')}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Start Preparing</Text>
              <Ionicons name="restaurant-outline" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {/* If Superadmin OR if already preparing/delivered, show a status indicator instead of button */}
          {(user?.role === 'superadmin' || item.status !== 'pending') && (
             <View style={[styles.statusInfoBox, { borderColor: statusInfo.color }]}>
                <Text style={[styles.statusInfoTxt, { color: statusInfo.color }]}>{statusInfo.label}</Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kitchen Orders</Text>
          <Text style={styles.subtitle}>Track and manage live orders</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.7}>
          <Ionicons name="refresh" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Branch Filter UI (SuperAdmin Only) */}
      {user?.role === 'superadmin' && (
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {['All', 'Auraiya', 'Dibiyapur'].map(b => (
              <TouchableOpacity 
                key={b} 
                style={[styles.filterPill, filterBranch === b && styles.filterPillActive]}
                onPress={() => setFilterBranch(b)}
              >
                <Text style={[styles.filterText, filterBranch === b && styles.filterTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 2 },
  refreshBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fdf2f2', alignItems: 'center', justifyContent: 'center' },

  filterSection: { backgroundColor: '#fff', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterRow: { paddingHorizontal: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f7fafc', marginRight: 10, borderWidth: 1, borderColor: '#edf2f7' },
  filterPillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterText: { fontSize: 13, fontWeight: '700', color: '#718096' },
  filterTextActive: { color: '#fff' },
  
  list: { padding: 20 },
  
  card: {
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 18, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  orderDate: { fontSize: 12, color: '#a0aec0', fontWeight: '600', marginTop: 2 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  branchTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f8fafc', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  branchTagText: { fontSize: 11, fontWeight: '700', color: '#718096', marginLeft: 4 },
  
  itemsBox: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 15, marginBottom: 15 },
  items: { fontSize: 15, color: '#4a5568', fontWeight: '600', lineHeight: 22 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 10 },
  priceLabel: { fontSize: 12, color: '#a0aec0', fontWeight: '700', textTransform: 'uppercase' },
  totalValue: { fontSize: 20, color: PRIMARY, fontWeight: '900' },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#718096', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 },
  
  customerContent: { marginBottom: 15, paddingLeft: 4 },
  custName: { fontSize: 16, fontWeight: '800', color: '#2d3748', marginBottom: 6 },
  custDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  custDetailText: { fontSize: 13, color: '#718096', marginLeft: 8, fontWeight: '500' },
  
  agentBox: { marginBottom: 20 },
  assignedAgent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e0f2fe' },
  agentAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, elevation: 1 },
  agentName: { fontSize: 15, fontWeight: '800', color: '#0369a1' },
  agentRole: { fontSize: 11, color: '#0ea5e9', fontWeight: '600', marginTop: 1 },
  
  agentScroll: { flexDirection: 'row' },
  agentChip: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginRight: 10, borderWidth: 1, borderColor: '#edf2f7', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  agentChipText: { fontSize: 13, fontWeight: '700', color: '#4a5568' },
  noAgents: { fontSize: 13, color: '#a0aec0', fontStyle: 'italic', paddingVertical: 10 },
  unassignedAgent: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#edf2f7', borderStyle: 'dashed' },
  unassignedText: { marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#a0aec0' },

  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 },
  inlineStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  inlineStatusText: { marginLeft: 6, fontSize: 13, fontWeight: '800' },
  statusInfoBox: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  statusInfoTxt: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, shadowColor: PRIMARY, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', marginRight: 8 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 15, fontSize: 18, color: '#a0aec0', fontWeight: '800' },
});
