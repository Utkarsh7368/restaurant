import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const PRIMARY = '#e23744';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/orders`);
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(`${API_URL}/admin/order/${id}`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? res.data : o));
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f39c12';
      case 'preparing': return '#3498db';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item._id.substring(item._id.length - 6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusTxt}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.amount}>₹{item.totalAmount}</Text>
      
      <View style={styles.customerBox}>
        <Text style={styles.custName}>👤 {item.user?.name || 'Unknown'}</Text>
        <Text style={styles.custPhone}>📞 {item.user?.phone || 'No phone'}</Text>
        <Text style={styles.custAddr}>📍 {item.user?.address || 'No address'}</Text>
      </View>

      <View style={styles.itemsBox}>
        {item.items.map((it, idx) => (
          <Text key={idx} style={styles.itemTxt}>• {it.quantity}x {it.name}</Text>
        ))}
      </View>

      <View style={styles.actions}>
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#3498db' }]} onPress={() => updateStatus(item._id, 'preparing')}>
            <Text style={styles.btnTxt}>Mark Preparing</Text>
          </TouchableOpacity>
        )}
        {item.status === 'preparing' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#27ae60' }]} onPress={() => updateStatus(item._id, 'delivered')}>
            <Text style={styles.btnTxt}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchOrders}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 12 },
  backTxt: { fontSize: 32, fontWeight: '300', color: '#1c1c1c', lineHeight: 32 },
  title: { fontSize: 20, fontWeight: '800', color: '#1c1c1c' },
  
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#1c1c1c' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  amount: { fontSize: 22, fontWeight: '800', color: PRIMARY, marginBottom: 12 },

  customerBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 12 },
  custName: { fontSize: 13, fontWeight: '700', color: '#1c1c1c', marginBottom: 2 },
  custPhone: { fontSize: 12, color: '#6b6b6b', marginBottom: 2 },
  custAddr: { fontSize: 12, color: '#6b6b6b' },

  itemsBox: { marginBottom: 16 },
  itemTxt: { fontSize: 13, color: '#444', marginBottom: 2 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  btnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  empty: { textAlign: 'center', marginTop: 40, color: '#aaa' }
});
