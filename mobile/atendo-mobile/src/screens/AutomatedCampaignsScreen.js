import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import whatsappService from '../services/whatsappService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function AutomatedCampaignsScreen() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    message: '',
    status: 'active',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchText, campaigns]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const result = await whatsappService.getAutomatedCampaigns({ limit: 100 });
      if (result.success) setCampaigns(result.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCampaigns();
    setRefreshing(false);
  };

  const filterCampaigns = () => {
    if (!searchText) {
      setFilteredCampaigns(campaigns);
      return;
    }
    const filtered = campaigns.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()));
    setFilteredCampaigns(filtered);
  };

  const handleCreate = () => {
    setEditingCampaign(null);
    setFormData({ name: '', trigger: '', message: '', status: 'active' });
    setModalVisible(true);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      trigger: campaign.trigger || '',
      message: campaign.message || '',
      status: campaign.status || 'active',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.message) {
        alert('Nome e mensagem são obrigatórios');
        return;
      }

      let result;
      if (editingCampaign) {
        result = await whatsappService.updateAutomatedCampaign(editingCampaign.id, formData);
      } else {
        result = await whatsappService.createAutomatedCampaign(formData);
      }

      if (result.success) {
        alert('Campanha salva');
        setModalVisible(false);
        loadCampaigns();
      }
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const result = await whatsappService.deleteAutomatedCampaign(id);
      if (result.success) {
        alert('Deletado');
        loadCampaigns();
      }
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.sm, marginHorizontal: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>{item.name}</Text>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>Trigger: {item.trigger}</Text>
        <View style={{ backgroundColor: item.status === 'active' ? COLORS.SUCCESS : COLORS.DANGER, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 4, marginTop: SPACING.xs, alignSelf: 'flex-start' }}>
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: '#fff' }}>{item.status}</Text>
        </View>
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
        <Text style={{ ...TYPOGRAPHY.HEADER, color: '#fff', marginBottom: SPACING.md }}>Campanhas Automáticas</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md }}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} />
          <TextInput placeholder="Buscar" value={searchText} onChangeText={setSearchText} style={{ flex: 1, paddingVertical: SPACING.md, marginLeft: SPACING.sm, ...TYPOGRAPHY.BODY }} />
        </View>
      </View>

      <FlatList data={filteredCampaigns} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 40 }}><MaterialCommunityIcons name="robot" size={48} color={COLORS.MUTED} /><Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>Nenhuma campanha</Text></View>} />

      <TouchableOpacity onPress={handleCreate} style={{ position: 'absolute', bottom: SPACING.lg, right: SPACING.lg, backgroundColor: COLORS.PRIMARY, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ flex: 1, marginTop: 50, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={{ ...TYPOGRAPHY.HEADER, marginBottom: SPACING.lg }}>{editingCampaign ? 'Editar' : 'Nova Campanha'}</Text>
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Nome *</Text>
              <TextInput placeholder="Nome" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} style={{ borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md, ...TYPOGRAPHY.BODY }} />
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Trigger</Text>
              <TextInput placeholder="Evento que dispara" value={formData.trigger} onChangeText={(text) => setFormData({ ...formData, trigger: text })} style={{ borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md, ...TYPOGRAPHY.BODY }} />
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Mensagem *</Text>
              <TextInput placeholder="Mensagem" value={formData.message} onChangeText={(text) => setFormData({ ...formData, message: text })} multiline numberOfLines={4} style={{ borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: 8, padding: SPACING.md, marginBottom: SPACING.md, ...TYPOGRAPHY.BODY }} />
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
