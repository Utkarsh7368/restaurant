import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default React.memo(FoodCard);
function FoodCard({ item }) {
  const navigation = useNavigation();
  const { addToCart, updateQuantity, cartItems } = useCart();
  const scaleVal = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate when qty switches between 0 and 1
  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [qty === 0]);

  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''));
  const cartItem = cartItems.find(i => i._id === item._id);
  const qty = cartItem ? cartItem.quantity : 0;

  const bounce = (ref) => {
    Animated.sequence([
      Animated.timing(ref, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.timing(ref, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleAdd = () => { addToCart(item); };
  const handlePlus = () => { bounce(btnScale); updateQuantity(item._id, 1); };
  const handleMinus = () => { bounce(btnScale); updateQuantity(item._id, -1); };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('FoodDetail', { item })}
      style={styles.card}
    >
      <View style={styles.content}>
        {/* Left: image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.img} />
          <View style={[styles.vegBadge, { borderColor: item.isVeg ? '#27ae60' : '#e74c3c' }]}>
            <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#27ae60' : '#e74c3c' }]} />
          </View>
        </View>
  
        {/* Center: info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.price}>₹{price}</Text>
        </View>
  
        {/* Right: ADD / qty */}
        <Animated.View style={[
          styles.right, 
          { 
            transform: [{ scale: Animated.multiply(btnScale, fadeAnim) }],
            opacity: fadeAnim 
          }
        ]}>
          {qty === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.6}>
              <Text style={styles.addTxt}>ADD</Text>
              <View style={styles.addPlus}><Text style={styles.addPlusTxt}>+</Text></View>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleMinus} activeOpacity={0.6}>
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handlePlus} activeOpacity={0.6}>
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#f2f2f2'
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  imageContainer: { position: 'relative' },
  img: { width: 76, height: 76, borderRadius: 16, resizeMode: 'cover' },
  vegBadge: { 
    position: 'absolute', bottom: 4, right: 4, 
    width: 14, height: 14, borderWidth: 1, 
    borderRadius: 2, backgroundColor: '#fff', 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1
  },
  vegDot: { width: 6, height: 6, borderRadius: 3 },
  
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  desc: { fontSize: 12, color: '#718096', marginBottom: 8, lineHeight: 16, fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '900', color: '#1a1a1a' },
  
  right: { marginLeft: 10 },
  addBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12,
    width: 76, height: 34,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 1
  },
  addTxt: { color: PRIMARY, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  addPlus: { position: 'absolute', top: 2, right: 4 },
  addPlusTxt: { fontSize: 10, color: PRIMARY, fontWeight: '900' },

  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 34, width: 76,
    justifyContent: 'space-between',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 3
  },
  qtyBtn: { paddingHorizontal: 8, height: '100%', justifyContent: 'center' },
  qtyBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
  qtyNum: { fontSize: 14, fontWeight: '900', color: '#fff' },
});
