import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, TextInput, Image, Modal, 
  ScrollView, Switch, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../data/menuData';

const PRIMARY = '#e23744';

export default function AdminMenuScreen() {
  const { user, token } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('thali');
  const [image, setImage] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isVeg, setIsVeg] = useState(true);

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

  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setName(dish.name);
      setPrice(String(dish.price));
      setDescription(dish.description || '');
      setCategory(dish.tags?.[0] || 'thali');
      setImage(dish.image || '');
      setIsPopular(dish.isPopular || false);
      setIsVeg(dish.isVeg !== false);
    } else {
      setEditingDish(null);
      setName('');
      setPrice('');
      setDescription('');
      setCategory('thali');
      setImage('');
      setIsPopular(false);
      setIsVeg(true);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingDish(null);
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please enter at least name and price');
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      price: parseFloat(price),
      description,
      tags: [category.toLowerCase()],
      image,
      isPopular,
      isVeg
    };

    const prevDishes = [...dishes]; // Rollback backup
    try {
      if (editingDish) {
        // Optimistic Update: Update the dish in the local list immediately
        setDishes(prev => prev.map(d => d._id === editingDish._id ? { ...d, ...payload } : d));
        closeModal();

        await axios.put(`${API_URL}/admin/menu/${editingDish._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // For new dishes, we wait for the server to get the generated ID
        await axios.post(`${API_URL}/admin/menu`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDishes();
        closeModal();
      }
    } catch (e) {
      setDishes(prevDishes); // Revert on failure
      Alert.alert('Error', 'Failed to save dish');
      console.warn(e);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (dish) => {
    setDishToDelete(dish);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!dishToDelete) return;
    
    const id = dishToDelete._id;
    const prevDishes = [...dishes];
    setDishes(prev => prev.filter(d => d._id !== id));
    setDeleteModalVisible(false);

    try {
      await axios.delete(`${API_URL}/admin/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(e) { 
      setDishes(prevDishes);
      Alert.alert('Error', 'Failed to delete'); 
    } finally {
      setDishToDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image ? <Image source={{uri: item.image}} style={styles.image} /> : <View style={[styles.image, {backgroundColor:'#eee'}]} />}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name} {item.isVeg ? '🟢' : '🔴'}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.cat}>{item.tags?.[0] || 'Uncategorized'}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)} style={[styles.actionBtn, {marginLeft: 10}]}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={dishes}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingDish ? 'Edit Dish' : 'Add New Dish'}</Text>
              <TouchableOpacity onPress={closeModal}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
              <Text style={styles.label}>Dish Name*</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Paneer Thali" />

              <Text style={styles.label}>Price (₹)*</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 199" keyboardType="numeric" />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 80}]} value={description} onChangeText={setDescription} placeholder="Description of the dish..." multiline />

              <Text style={styles.label}>Category (Select one)*</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPicker}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    onPress={() => setCategory(cat.id)}
                    style={[styles.catPill, category === cat.id && styles.catPillActive]}
                  >
                    <Text style={[styles.catPillTxt, category === cat.id && styles.catPillTxtActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Image URL</Text>
              <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://ex.com/img.jpg" />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Is Popular?</Text>
                <Switch value={isPopular} onValueChange={setIsPopular} trackColor={{ true: PRIMARY }} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Is Vegetarian?</Text>
                <Switch value={isVeg} onValueChange={setIsVeg} trackColor={{ true: '#27ae60' }} />
              </View>

              <TouchableOpacity style={[styles.saveBtn, isSaving && {opacity: 0.7}]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Dish</Text>}
              </TouchableOpacity>
              <View style={{height: 40}} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal animationType="fade" transparent={true} visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="warning-outline" size={40} color={PRIMARY} />
            </View>
            <Text style={styles.confirmTitle}>Delete Dish?</Text>
            <Text style={styles.confirmText}>Do you want to delete this dish from your menu?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.noBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.noBtnText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={handleDelete}>
                <Text style={styles.yesBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12, resizeMode: 'cover' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1c1c1c', marginBottom: 4 },
  price: { fontSize: 14, color: PRIMARY, fontWeight: '800' },
  cat: { fontSize: 12, color: '#999', marginTop: 4, textTransform: 'capitalize' },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, backgroundColor: '#f0f4f8', borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1c1c1c' },
  
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#f0f2f5', borderRadius: 10, padding: 12, fontSize: 15, color: '#1c1c1c' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  catPicker: { flexDirection: 'row', marginBottom: 10 },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f2f5', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  catPillActive: { backgroundColor: '#fce8ea', borderColor: PRIMARY },
  catPillTxt: { fontSize: 13, color: '#666', fontWeight: '600' },
  catPillTxtActive: { color: PRIMARY, fontWeight: '700' },

  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', maxWidth: 400 },
  confirmIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fce8ea', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  confirmTitle: { fontSize: 22, fontWeight: '800', color: '#1c1c1c', marginBottom: 10 },
  confirmText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  confirmActions: { flexDirection: 'row', width: '100%' },
  noBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f2f5', marginRight: 12, alignItems: 'center' },
  noBtnText: { fontSize: 16, fontWeight: '700', color: '#444' },
  yesBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: PRIMARY, alignItems: 'center' },
  yesBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' }
});
