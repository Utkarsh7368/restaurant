import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, StatusBar, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useBranch } from '../context/BranchContext';

const PRIMARY = '#e23744';

function CartItem({ item }) {
  const { updateQuantity } = useCart();
  const scale = useRef(new Animated.Value(1)).current;
  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''));

  const bump = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={[styles.itemContainer, { transform: [{ scale }] }]}>
      <Image source={{ uri: item.image }} style={styles.itemImg} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemPricePer}>₹{price} each</Text>
        <Text style={styles.itemTotalPrice}>₹{price * item.quantity}</Text>
      </View>
      <View style={styles.itemRight}>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => { bump(); updateQuantity(item._id, -1); }}>
            <Ionicons name="remove" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => { bump(); updateQuantity(item._id, 1); }}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function CartScreen() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const DELIVERY = 40, TAX = Math.round(cartTotal * 0.05), GRAND = cartTotal + DELIVERY + TAX;

  const handlePlaceOrder = async () => {
    if (!user?.phone || !user?.address) {
      Alert.alert('Incomplete Profile', 'Please provide a delivery address and phone number to order.', [
        { text: 'Set Location', onPress: () => navigation.navigate('MapScreen') },
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
        totalAmount: GRAND,
        paymentMethod: 'COD',
        branch: selectedBranch
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
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Cart</Text>
            <Text style={styles.subtitle}>{cartItems.length} items to order</Text>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearBadge}>
            <Text style={styles.clearBtn}>Empty Cart</Text>
          </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  headerSafe: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 20 
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 2 },
  clearBadge: { backgroundColor: '#fdf2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  clearBtn: { fontSize: 13, color: PRIMARY, fontWeight: '800' },

  emptyContainer: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 70, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#a0aec0', fontWeight: '600' },

  list: { padding: 20 },

  itemContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  itemImg: { width: 64, height: 64, borderRadius: 14, resizeMode: 'cover' },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  itemPricePer: { fontSize: 12, color: '#a0aec0', fontWeight: '700', marginBottom: 4 },
  itemTotalPrice: { fontSize: 16, fontWeight: '900', color: PRIMARY },
  
  itemRight: { marginLeft: 10 },
  qtyRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: PRIMARY, 
    borderRadius: 12,
    height: 36,
    paddingHorizontal: 4,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  qtyBtn: { padding: 6 },
  qtyNum: { fontSize: 15, fontWeight: '900', color: '#fff', paddingHorizontal: 8 },

  bill: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: '#f0f0f0' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#718096', fontWeight: '600' },
  billVal: { fontSize: 14, fontWeight: '800', color: '#2d3748' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  billTotal: { fontSize: 18, fontWeight: '900', color: '#1a1a1a' },
  billTotalVal: { fontSize: 18, fontWeight: '900', color: PRIMARY },

  checkSafe: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkLabel: { fontSize: 12, color: '#a0aec0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  checkAmount: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  checkoutBtn: { 
    backgroundColor: PRIMARY, 
    flexDirection: 'row',
    paddingHorizontal: 24, 
    height: 56, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 
  },
  checkoutDisabled: { opacity: 0.7 },
  checkoutTxt: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
