import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, TextInput, Image, Modal, 
  ScrollView, Switch, KeyboardAvoidingView, Platform, UIManager,
  SectionList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// import { CATEGORIES } from '../../data/menuData'; // DEPRECATED: Using dynamic categories now
import * as ImagePicker from 'expo-image-picker';

const PRIMARY = '#e23744';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/drby3rlmx/image/upload';
const UPLOAD_PRESET = 'swadsadan_preset';

const AdminDishCard = React.memo(({ dish, openModal, confirmDelete }) => {
  return (
    <View style={styles.card}>
      {dish.image ? 
        <Image source={{uri: dish.image}} style={styles.image} /> : 
        <View style={[styles.image, {backgroundColor:'#f0f0f0', alignItems:'center', justifyContent:'center'}]}>
          <Ionicons name="fast-food-outline" size={24} color="#ccc" />
        </View>
      }
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
          <View style={[styles.vegIndicator, {borderColor: dish.isVeg ? '#27ae60' : '#e74c3c'}]}>
            <View style={[styles.vegDot, {backgroundColor: dish.isVeg ? '#27ae60' : '#e74c3c'}]} />
          </View>
        </View>
        <Text style={styles.price}>₹{dish.price}</Text>
        {dish.isPopular && <View style={styles.popBadge}><Text style={styles.popText}>Popular</Text></View>}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(dish)} style={styles.editBtn}>
          <Ionicons name="pencil-sharp" size={16} color="#444" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(dish)} style={styles.delBtn}>
          <Ionicons name="trash" size={16} color="#e53e3e" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function AdminMenuScreen() {
  const { user, token } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [expandedCats, setExpandedCats] = useState(['thali']); 
  const [isUploading, setIsUploading] = useState(false);

  const toggleCat = (catId) => {
    // LayoutAnimation is a no-op in New Architecture, keeping it simple
    setExpandedCats(prev => 
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

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
      const menuRes = await axios.get(`${API_URL}/menu`);
      const catRes = await axios.get(`${API_URL}/category`);
      setDishes(menuRes.data || []);
      setCategories(catRes.data || []);
    } catch (e) {
      console.warn('Failed to fetch data', e);
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
    setIsUploading(false);
  };

  const handlePickImage = async (useCamera = false) => {
    try {
      const permission = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Denied', `We need ${useCamera ? 'camera' : 'gallery'} access to upload dish photos.`);
        return;
      }

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 });

      if (!result.canceled) {
        uploadToCloudinary(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to open image selector');
    }
  };

  const uploadToCloudinary = async (uri) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      // Using native fetch to COMPLETELY bypass any axios interceptors/headers
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Note: DO NOT set 'Content-Type' manually for FormData!
        },
      });

      const resData = await response.json();

      if (resData.secure_url) {
        setImage(resData.secure_url);
      } else {
        console.error('Cloudinary Error Data:', resData);
        Alert.alert('Upload Failed', resData.error?.message || 'Check your settings.');
      }
    } catch (e) {
      console.error('Fetch Error:', e);
      Alert.alert('Error', 'Network request failed.');
    } finally {
      setIsUploading(false);
    }
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

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={PRIMARY} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Menu Management</Text>
          <Text style={styles.subtitle}>Manage your restaurant's identity</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={categories.map(cat => ({
          title: cat.name,
          id: cat.id,
          icon: cat.icon,
          data: dishes.filter(d => (d.tags?.[0] || 'thali').toLowerCase() === cat.id.toLowerCase())
        })).filter(s => s.data.length > 0)}
        keyExtractor={(item) => item._id}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={4}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === 'android'}
        renderSectionHeader={({ section }) => (
          <TouchableOpacity 
            style={[styles.catHeader, expandedCats.includes(section.id) && styles.catHeaderOpen]} 
            onPress={() => toggleCat(section.id)}
            activeOpacity={0.7}
          >
            <View style={styles.catTitleRow}>
              <Text style={styles.catEmoji}>{section.icon || '🍽️'}</Text>
              <Text style={styles.catName}>{section.title}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{section.data.length}</Text>
              </View>
            </View>
            <Ionicons name={expandedCats.includes(section.id) ? "chevron-up" : "chevron-down"} size={20} color="#999" />
          </TouchableOpacity>
        )}
        renderItem={({ item, section }) => (
          expandedCats.includes(section.id) ? (
            <View style={{ paddingHorizontal: 20 }}>
              <AdminDishCard dish={item} openModal={openModal} confirmDelete={confirmDelete} />
            </View>
          ) : null
        )}
        ListFooterComponent={<View style={{ height: 100 }} />}
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
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    onPress={() => setCategory(cat.id)}
                    style={[styles.catPill, category === cat.id && styles.catPillActive]}
                  >
                    <Text style={[styles.catPillTxt, category === cat.id && styles.catPillTxtActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Dish Image*</Text>
              <View style={styles.imagePickerContainer}>
                {image ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: image }} style={styles.formImagePreview} />
                    <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImage('')}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageOptionsRow}>
                    <TouchableOpacity style={styles.imageOption} onPress={() => handlePickImage(false)}>
                      <View style={styles.imageIconWrap}><Ionicons name="images-outline" size={28} color={PRIMARY} /></View>
                      <Text style={styles.imageOptionTxt}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageOption} onPress={() => handlePickImage(true)}>
                      <View style={styles.imageIconWrap}><Ionicons name="camera-outline" size={28} color={PRIMARY} /></View>
                      <Text style={styles.imageOptionTxt}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isUploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color={PRIMARY} size="small" />
                    <Text style={styles.uploadTxt}>Uploading...</Text>
                  </View>
                )}
              </View>

              <Text style={styles.label}>Manual Image URL (Optional)</Text>
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
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  addBtn: { 
    backgroundColor: PRIMARY, 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  
  scroll: { flex: 1 },
  list: { padding: 20 },
  
  catSection: { marginBottom: 16, borderRadius: 20, backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  catHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16,
    backgroundColor: '#fff'
  },
  catHeaderOpen: { borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  catTitleRow: { flexDirection: 'row', alignItems: 'center' },
  catEmoji: { fontSize: 18, marginRight: 10 },
  catName: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  countBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 10 },
  countText: { fontSize: 12, fontWeight: '700', color: '#888' },
  
  catContent: { padding: 12, backgroundColor: '#fafafa' },
  
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    elevation: 1
  },
  image: { width: 60, height: 60, borderRadius: 12, marginRight: 14, resizeMode: 'cover' },
  info: { flex: 1, paddingRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginRight: 8, maxWidth: '85%' },
  vegIndicator: { width: 12, height: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  vegDot: { width: 5, height: 5, borderRadius: 2.5 },
  price: { fontSize: 14, color: PRIMARY, fontWeight: '900' },
  popBadge: { backgroundColor: '#fff8e1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  popText: { fontSize: 10, fontWeight: '800', color: '#ff8f00', textTransform: 'uppercase' },
  
  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  editBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#ebf8ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#bee3f8' },
  delBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center', marginLeft: 8, borderWidth: 1, borderColor: '#fed7d7' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  
  form: { flex: 1 },
  label: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', marginBottom: 10, marginTop: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f5f7fa', borderRadius: 16, padding: 16, fontSize: 16, color: '#1a1a1a', borderWidth: 1, borderColor: '#edf2f7' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, backgroundColor: '#f8fafc', padding: 14, borderRadius: 16 },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginTop: 35, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  catPicker: { flexDirection: 'row', marginBottom: 5 },
  catPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#edf2f7' },
  catPillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catPillTxt: { fontSize: 14, color: '#4a5568', fontWeight: '700' },
  catPillTxtActive: { color: '#fff', fontWeight: '800' },

  imagePickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#edf2f7',
    borderStyle: 'dashed',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  imageOptionsRow: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  imageOption: { alignItems: 'center', paddingHorizontal: 25 },
  imageIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 1 },
  imageOptionTxt: { fontSize: 13, fontWeight: '700', color: '#718096' },
  
  previewWrap: { width: '100%', height: '100%', position: 'relative' },
  formImagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImgBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 12 },
  
  uploadOverlay: { position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems:'center' },
  uploadTxt: { fontSize: 12, fontWeight: '700', color: PRIMARY, marginTop: 4 },

  subtitle: { fontSize: 13, color: '#a0aec0', fontWeight: '600', marginTop: 2 },

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
