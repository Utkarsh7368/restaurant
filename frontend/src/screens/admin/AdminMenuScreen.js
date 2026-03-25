import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function AdminMenuScreen() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = async () => {
    try {
      const res = await axios.get(`${API_URL}/menu`);
      setDishes(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch dishes', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchDishes(); }, []));

  const handleDelete = (id) => {
    Alert.alert("Delete Dish", "Are you sure you want to permanently delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await axios.delete(`${API_URL}/admin/menu/${id}`);
            fetchDishes();
          } catch(e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image ? <Image source={{uri: item.image}} style={styles.image} /> : <View style={[styles.image, {backgroundColor:'#eee'}]} />}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.cat}>{item.tags?.[0] || 'Uncategorized'}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.delBtn}>
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Coming Soon', 'Full dish creation form requires navigation wiring.')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={dishes}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1c1c1c' },
  addBtn: { backgroundColor: PRIMARY, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  list: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1c1c1c', marginBottom: 4 },
  price: { fontSize: 14, color: PRIMARY, fontWeight: '800' },
  cat: { fontSize: 12, color: '#999', marginTop: 4, textTransform: 'capitalize' },
  delBtn: { padding: 8 }
});
