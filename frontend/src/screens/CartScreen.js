import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const PRIMARY = '#e23744';

function CartItem({ item }) {
  const { updateQuantity } = useCart();
  const scale = useRef(new Animated.Value(1)).current;
  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''));

  const bump = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
      <Image source={{ uri: item.image }} style={styles.itemImg} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{price * item.quantity}</Text>
      </View>
      <View style={styles.itemRight}>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => { bump(); updateQuantity(item._id, -1); }}>
            <Text style={styles.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => { bump(); updateQuantity(item._id, 1); }}>
            <Text style={styles.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const DELIVERY = 40, TAX = Math.round(cartTotal * 0.05), GRAND = cartTotal + DELIVERY + TAX;

  const handlePlaceOrder = async () => {
    if (!user?.phone || !user?.address) {
      Alert.alert('Incomplete Profile', 'Please provide a delivery address and phone number to order.', [
        { text: 'Complete Profile', onPress: () => navigation.navigate('CompleteProfile') },
        { text: 'Cancel', style: 'cancel' }
      ]);
      return;
    }

    setLoading(true);

    try {
      const itemsPayload = cartItems.map(item => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''))
      }));

      const res = await axios.post(`${API_URL}/orders/create`, {
        items: itemsPayload,
        totalAmount: GRAND
      });

      clearCart();
      navigation.navigate('OrderSuccess', { orderId: res.data._id });

    } catch (err) {
      console.warn(err);
      Alert.alert('Order Failed', err.response?.data?.msg || 'Could not place order. Please try again.');
    }
    
    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer} edges={['top','bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add items from the menu</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
          <TouchableOpacity onPress={clearCart}><Text style={styles.clearBtn}>Clear All</Text></TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList data={cartItems} keyExtractor={i=>i._id} renderItem={({item})=> <CartItem item={item} />}
        contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.bill}>
            <View style={styles.billRow}><Text style={styles.billLabel}>Subtotal</Text><Text style={styles.billVal}>₹{cartTotal}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Delivery</Text><Text style={styles.billVal}>₹{DELIVERY}</Text></View>
            <View style={styles.billRow}><Text style={styles.billLabel}>Tax (5%)</Text><Text style={styles.billVal}>₹{TAX}</Text></View>
            <View style={styles.divider} />
            <View style={styles.billRow}><Text style={styles.billTotal}>Total</Text><Text style={styles.billTotalVal}>₹{GRAND}</Text></View>
          </View>
        }
      />

      {/* Sticky bottom */}
      <SafeAreaView edges={['bottom']} style={styles.checkSafe}>
        <View style={styles.bottomBar}>
          <View style={styles.checkRow}>
            <View>
              <Text style={styles.checkLabel}>Grand Total</Text>
              <Text style={styles.checkAmount}>₹{GRAND}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, loading && styles.checkoutDisabled]} 
              activeOpacity={0.85} 
              onPress={handlePlaceOrder} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.checkoutTxt}>Place Order →</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safe: { backgroundColor: '#fff' },
  emptyContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1c1c1c', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#aaa' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1c1c1c' },
  clearBtn: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },

  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  itemImg: { width: 56, height: 56, borderRadius: 12, resizeMode: 'cover' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1c1c1c', marginBottom: 3 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: '#6b6b6b' },
  itemRight: { marginLeft: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 8 },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  qtyBtnTxt: { color: PRIMARY, fontSize: 15, fontWeight: '700' },
  qtyNum: { fontSize: 13, fontWeight: '800', color: '#1c1c1c', paddingHorizontal: 4 },

  bill: { backgroundColor: '#f7f7f7', borderRadius: 16, padding: 16, marginTop: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 13, color: '#6b6b6b' },
  billVal: { fontSize: 13, fontWeight: '600', color: '#1c1c1c' },
  divider: { height: 0.5, backgroundColor: '#e0e0e0', marginVertical: 8 },
  billTotal: { fontSize: 15, fontWeight: '800', color: '#1c1c1c' },
  billTotalVal: { fontSize: 15, fontWeight: '800', color: PRIMARY },

  checkSafe: { backgroundColor: '#fff' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  checkLabel: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  checkAmount: { fontSize: 20, fontWeight: '800', color: '#1c1c1c' },
  checkoutBtn: { backgroundColor: PRIMARY, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, minWidth: 140, alignItems: 'center' },
  checkoutDisabled: { opacity: 0.7 },
  checkoutTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
