import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, RefreshControl, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function GenericScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      // Simulando dados
      setItems([]);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      alert('Salvo com sucesso');
      setModalVisible(false);
      loadItems();
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    try {
      alert('Deletado com sucesso');
      loadItems();
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.sm, marginHorizontal: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>{item.name || 'Item'}</Text>
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: COLORS.PRIMARY, padding: SPACING.lg, paddingTop: SPACING.xl }}>
        <Text style={{ ...TYPOGRAPHY.HEADER, color: '#fff', marginBottom: SPACING.md }}>Gerenciamento</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} />
          <TextInput placeholder="Buscar" value={searchText} onChangeText={setSearchText} style={{ flex: 1, paddingVertical: SPACING.md, marginLeft: SPACING.sm, ...TYPOGRAPHY.BODY }} />
        </View>
      </View>

      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id?.toString()} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}><MaterialCommunityIcons name="inbox" size={48} color={COLORS.MUTED} /><Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>Nenhum item</Text></View>} />

      <TouchableOpacity onPress={handleCreate} style={{ position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.PRIMARY, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, marginTop: 50, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={{ ...TYPOGRAPHY.HEADER, marginBottom: SPACING.lg }}>{editingItem ? 'Editar' : 'Novo'}</Text>
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
