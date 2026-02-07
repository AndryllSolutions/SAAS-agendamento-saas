import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import productsService from '../services/productsService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function BrandsCategoriesScreen() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('brands');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [brandsRes, categoriesRes] = await Promise.all([
        productsService.getBrands({ limit: 100 }),
        productsService.getCategories({ limit: 100 }),
      ]);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', notes: '' });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      notes: item.notes || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        alert('Nome é obrigatório');
        return;
      }

      let result;
      if (activeTab === 'brands') {
        if (editingItem) {
          result = await productsService.updateBrand(editingItem.id, formData);
        } else {
          result = await productsService.createBrand(formData);
        }
      } else {
        if (editingItem) {
          result = await productsService.updateCategory(editingItem.id, formData);
        } else {
          result = await productsService.createCategory(formData);
        }
      }

      if (result.success) {
        alert('Salvo com sucesso');
        setModalVisible(false);
        loadData();
      }
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    try {
      let result;
      if (activeTab === 'brands') {
        result = await productsService.deleteBrand(id);
      } else {
        result = await productsService.deleteCategory(id);
      }
      if (result.success) {
        alert('Deletado com sucesso');
        loadData();
      }
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.sm, marginHorizontal: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>{item.name}</Text>
        {item.description && <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>{item.description}</Text>}
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={{ backgroundColor: COLORS.PRIMARY, padding: SPACING.sm, borderRadius: 6 }}>
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ backgroundColor: COLORS.DANGER, padding: SPACING.sm, borderRadius: 6 }}>
          <MaterialCommunityIcons name="delete" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.PRIMARY} /></View>;

  const data = activeTab === 'brands' ? brands : categories;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: COLORS.PRIMARY, padding: SPACING.lg, paddingTop: SPACING.xl }}>
        <Text style={{ ...TYPOGRAPHY.HEADER, color: '#fff', marginBottom: SPACING.md }}>Marcas e Categorias</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <TouchableOpacity onPress={() => setActiveTab('brands')} style={{ flex: 1, padding: SPACING.md, backgroundColor: activeTab === 'brands' ? '#fff' : 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
            <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: activeTab === 'brands' ? COLORS.PRIMARY : '#fff' }}>Marcas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('categories')} style={{ flex: 1, padding: SPACING.md, backgroundColor: activeTab === 'categories' ? '#fff' : 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
            <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: activeTab === 'categories' ? COLORS.PRIMARY : '#fff' }}>Categorias</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}><MaterialCommunityIcons name="tag" size={48} color={COLORS.MUTED} /><Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>Nenhum item encontrado</Text></View>} />

      <TouchableOpacity onPress={handleCreate} style={{ position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.PRIMARY, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, marginTop: 50, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={{ ...TYPOGRAPHY.HEADER, marginBottom: SPACING.lg }}>{editingItem ? 'Editar' : 'Novo'}</Text>
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Nome *</Text>
              <TextInput placeholder="Nome" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} style={{ borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md, ...TYPOGRAPHY.BODY }} />
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Descrição</Text>
              <TextInput placeholder="Descrição" value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} multiline numberOfLines={3} style={{ borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md, ...TYPOGRAPHY.BODY }} />
              <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, padding: SPACING.md, borderRadius: 8, borderWidth: 1, borderColor: COLORS.BORDER }}><Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: COLORS.MUTED }}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={{ flex: 1, padding: SPACING.md, borderRadius: 8, backgroundColor: COLORS.PRIMARY }}><Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: '#fff' }}>Salvar</Text></TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
