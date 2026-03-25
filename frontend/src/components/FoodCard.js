import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const PRIMARY = '#e23744';

export default function FoodCard({ item }) {
  const navigation = useNavigation();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const scaleVal = useRef(new Animated.Value(1)).current;
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

  const handleAdd = () => { bounce(btnScale); addToCart(item); };
  const handlePlus = () => { bounce(btnScale); updateQuantity(item.id, 1); };
  const handleMinus = () => { bounce(btnScale); updateQuantity(item.id, -1); };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FoodDetail', { item })}
      style={styles.row}
    >
      {/* Left: image */}
      <Image source={{ uri: item.image }} style={styles.img} />

      {/* Center: info */}
      <View style={styles.info}>
        <View style={styles.vegRow}>
          <View style={styles.vegDot}><View style={styles.vegInner} /></View>
        </View>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        <Text style={styles.price}>₹{price}</Text>
      </View>

      {/* Right: ADD / qty */}
      <Animated.View style={[styles.right, { transform: [{ scale: btnScale }] }]}>
        {qty === 0 ? (
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
            <Text style={styles.addTxt}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleMinus}><Text style={styles.qtyBtnTxt}>−</Text></TouchableOpacity>
            <Text style={styles.qtyNum}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handlePlus}><Text style={styles.qtyBtnTxt}>+</Text></TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  img: { width: 68, height: 68, borderRadius: 14, resizeMode: 'cover' },
  info: { flex: 1, marginLeft: 14 },
  vegRow: { marginBottom: 3 },
  vegDot: {
    width: 16, height: 16, borderRadius: 3, borderWidth: 1.2,
    borderColor: '#27ae60', backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  vegInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27ae60' },
  name: { fontSize: 15, fontWeight: '700', color: '#1c1c1c', marginBottom: 2 },
  desc: { fontSize: 12, color: '#6b6b6b', marginBottom: 4, lineHeight: 16 },
  price: { fontSize: 14, fontWeight: '700', color: '#1c1c1c' },
  right: { marginLeft: 10 },
  addBtn: {
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 6,
  },
  addTxt: { color: PRIMARY, fontSize: 13, fontWeight: '800' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 10,
    overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  qtyBtnTxt: { color: PRIMARY, fontSize: 16, fontWeight: '700' },
  qtyNum: { fontSize: 14, fontWeight: '800', color: '#1c1c1c', paddingHorizontal: 6 },
});
