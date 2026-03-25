import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const PRIMARY = '#e23744';

export default function GridFoodCard({ item }) {
  const navigation = useNavigation();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const btnScale = useRef(new Animated.Value(1)).current;

  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''));
  const cartItem = cartItems.find(i => i.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const bounce = (ref) => {
    Animated.sequence([
      Animated.spring(ref, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(ref, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FoodDetail', { item })}
      style={[styles.card, { width: CARD_W }]}
    >
      <Image source={{ uri: item.image }} style={styles.img} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>₹{price}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => { bounce(btnScale); addToCart(item); }} activeOpacity={0.8}>
              <Text style={styles.addTxt}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => { bounce(btnScale); updateQuantity(item.id, -1); }}><Text style={styles.qtyBtnTxt}>−</Text></TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => { bounce(btnScale); updateQuantity(item.id, 1); }}><Text style={styles.qtyBtnTxt}>+</Text></TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  img: { width: '100%', height: 110, resizeMode: 'cover' },
  body: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: '#1c1c1c', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  price: { fontSize: 14, fontWeight: '700', color: '#1c1c1c' },
  rating: { fontSize: 11, color: '#6b6b6b' },
  addBtn: {
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 8,
    alignItems: 'center', paddingVertical: 5,
  },
  addTxt: { color: PRIMARY, fontSize: 12, fontWeight: '800' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 8, paddingVertical: 2,
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 3 },
  qtyBtnTxt: { color: PRIMARY, fontSize: 15, fontWeight: '700' },
  qtyNum: { fontSize: 13, fontWeight: '800', color: '#1c1c1c', paddingHorizontal: 4 },
});
