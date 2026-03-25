import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, StatusBar,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const PRIMARY = '#e23744';

export default function FoodDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { addToCart, updateQuantity, cartItems } = useCart();
  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹',''));
  const cartItem = cartItems.find(i => i._id === item._id);
  const qty = cartItem ? cartItem.quantity : 0;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const bounce = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Image source={{ uri: item.image }} style={styles.heroImg} />
      <View style={styles.heroOverlay} />
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTxt}>‹</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.vegRow}>
            <View style={styles.vegDot}><View style={styles.vegInner} /></View>
            <Text style={styles.vegLabel}>Pure Veg</Text>
          </View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          {item.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map(t => <View key={t} style={styles.tag}><Text style={styles.tagTxt}>{t}</Text></View>)}
            </View>
          )}
          <Text style={styles.descTitle}>About</Text>
          <Text style={styles.desc}>{item.description}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceVal}>₹{price}</Text>
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.barSafe}>
          <View style={styles.bar}>
            <View>
              <Text style={styles.barLabel}>{qty > 0 ? `${qty} × ₹${price}` : 'per item'}</Text>
              <Text style={styles.barTotal}>{qty > 0 ? `₹${price*qty}` : `₹${price}`}</Text>
            </View>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              {qty === 0 ? (
                <TouchableOpacity style={styles.addBtn} onPress={() => { bounce(); addToCart(item); }} activeOpacity={0.85}>
                  <Text style={styles.addBtnTxt}>ADD TO CART</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyCtrl}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => { bounce(); updateQuantity(item._id, -1); }}>
                    <Text style={styles.qtyBtnTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => { bounce(); updateQuantity(item._id, 1); }}>
                    <Text style={styles.qtyBtnTxt}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImg: { width: '100%', height: 280, resizeMode: 'cover', position: 'absolute', top: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, backgroundColor: 'rgba(0,0,0,0.25)' },
  safeTop: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  backBtn: { marginTop: 6, marginLeft: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 24, fontWeight: '300', lineHeight: 30 },

  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 255 },
  scroll: { padding: 20, paddingBottom: 8 },

  vegRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  vegDot: { width: 16, height: 16, borderRadius: 3, borderWidth: 1.2, borderColor: '#27ae60', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  vegInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27ae60' },
  vegLabel: { fontSize: 11, fontWeight: '700', color: '#27ae60' },

  name: { fontSize: 22, fontWeight: '800', color: '#1c1c1c', marginBottom: 4, lineHeight: 28 },
  rating: { fontSize: 13, color: '#6b6b6b', marginBottom: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tag: { backgroundColor: '#f7f7f7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8, marginBottom: 4 },
  tagTxt: { fontSize: 11, fontWeight: '600', color: '#6b6b6b', textTransform: 'capitalize' },

  descTitle: { fontSize: 14, fontWeight: '700', color: '#1c1c1c', marginBottom: 6 },
  desc: { fontSize: 13, color: '#6b6b6b', lineHeight: 20, marginBottom: 20 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, color: '#aaa' },
  priceVal: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },

  barSafe: { backgroundColor: '#fff' },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  barLabel: { fontSize: 11, color: '#aaa', marginBottom: 2 },
  barTotal: { fontSize: 18, fontWeight: '800', color: '#1c1c1c' },
  addBtn: { backgroundColor: PRIMARY, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  addBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 4 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  qtyBtnTxt: { color: PRIMARY, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  qtyNum: { fontSize: 16, fontWeight: '800', color: '#1c1c1c', marginHorizontal: 10 },
});
