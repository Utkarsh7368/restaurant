import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, TextInput, Modal, 
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#e23744';

export default function AdminCategoryScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🍽️');
  const [order, setOrder] = useState('0');

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/category`);
      setCategories(res.data || []);
    } catch (e) {
      console.warn('Failed to fetch categories', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCategories(); }, []));

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setIcon(cat.icon || '🍽️');
      setOrder(String(cat.order || '0'));
    } else {
      setEditingCategory(null);
      setName('');
      setIcon('🍽️');
      setOrder(String(categories.length + 1));
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setIsSaving(true);
    // Slugify name for ID if it's a new category
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const payload = {
      name: name.trim(),
      icon,
      order: parseInt(order) || 0
    };

    try {
      if (editingCategory) {
        await axios.patch(`${API_URL}/category/${editingCategory._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/category`, { ...payload, id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchCategories();
      closeModal();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.msg || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (cat) => {
    setCatToDelete(cat);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    try {
      await axios.delete(`${API_URL}/category/${catToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
      setDeleteModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete category');
    } finally {
      setCatToDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Text style={styles.catEmoji}>{item.icon || '🍽️'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.catName}>{item.name}</Text>
        <Text style={styles.catId}>ID: {item.id}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
          <Ionicons name="pencil" size={18} color="#4A5568" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.delBtn}>
          <Ionicons name="trash" size={18} color={PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 15}}>
          <Text style={styles.title}>Menu Categories</Text>
          <Text style={styles.subtitle}>Add or edit dish groupings</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="list-outline" size={80} color="#eee" />
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'New Category'}</Text>
              <TouchableOpacity onPress={closeModal}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Desserts" />

              <Text style={styles.label}>Icon (Emoji)</Text>
              <TextInput style={styles.input} value={icon} onChangeText={setIcon} placeholder="e.g. 🍰" />

              <Text style={styles.label}>Display Order</Text>
              <TextInput style={styles.input} value={order} onChangeText={setOrder} placeholder="e.g. 1 (smaller shows first)" keyboardType="numeric" />

              {!editingCategory && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#718096" />
                  <Text style={styles.infoBoxText}>
                    A unique ID will be created automatically based on the name.
                  </Text>
                </View>
              )}

              <TouchableOpacity style={[styles.saveBtn, isSaving && {opacity: 0.7}]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Category</Text>}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Delete Confirmation */}
      <Modal animationType="fade" transparent={true} visible={deleteModalVisible} onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons name="warning" size={50} color={PRIMARY} />
            <Text style={styles.confirmTitle}>Delete Category?</Text>
            <Text style={styles.confirmText}>Items already in this category won't be deleted, but this category will disappear from the menu filters.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.noBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.noBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.yesBtn} onPress={handleDelete}>
                <Text style={styles.yesBtnText}>Delete</Text>
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
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 2 },
  addBtn: { 
    backgroundColor: PRIMARY, 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  list: { padding: 20 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 12, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOpacity: 0.02, elevation: 2
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fdf2f2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  catEmoji: { fontSize: 22 },
  info: { flex: 1 },
  catName: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  catId: { fontSize: 12, color: '#cbd5e0', fontWeight: '700', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 10 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f7fafc', justifyContent: 'center', alignItems: 'center' },
  delBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff5f5', justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a' },
  label: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 10, marginTop: 15, textTransform: 'uppercase' },
  input: { backgroundColor: '#f5f7fa', borderRadius: 16, padding: 16, fontSize: 16, color: '#1a1a1a', borderWidth: 1, borderColor: '#edf2f7' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginTop: 15 },
  infoBoxText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#718096', fontWeight: '500' },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', maxWidth: 400 },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: '#1c1c1c', marginTop: 15, marginBottom: 10 },
  confirmText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', width: '100%', gap: 12 },
  noBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f0f2f5', alignItems: 'center' },
  noBtnText: { fontSize: 16, fontWeight: '700', color: '#444' },
  yesBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: PRIMARY, alignItems: 'center' },
  yesBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyWrap: { alignItems: 'center', paddingVertical: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#cbd5e0', fontWeight: '700' }
});
