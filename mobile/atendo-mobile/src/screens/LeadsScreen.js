import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import whatsappService from '../services/whatsappService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const LEAD_STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const LEAD_STATUS = ['new', 'contacted', 'interested', 'not_interested', 'converted'];

export default function LeadsScreen() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    source: '',
    stage: 'prospect',
    status: 'new',
    notes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchText, leads]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const result = await whatsappService.getLeads({ limit: 100 });
      if (result.success) {
        setLeads(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const filterLeads = () => {
    if (!searchText) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(
      (lead) =>
        lead.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        lead.email?.includes(searchText) ||
        lead.phone?.includes(searchText) ||
        lead.whatsapp?.includes(searchText)
    );
    setFilteredLeads(filtered);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      whatsapp: '',
      source: '',
      stage: 'prospect',
      status: 'new',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setFormData({
      full_name: lead.full_name,
      email: lead.email || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      source: lead.source || '',
      stage: lead.stage || 'prospect',
      status: lead.status || 'new',
      notes: lead.notes || '',
    });
    setModalVisible(true);
  };

  const handleSaveLead = async () => {
    try {
      if (!formData.full_name) {
        alert('Nome é obrigatório');
        return;
      }

      const data = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        source: formData.source,
        stage: formData.stage,
        status: formData.status,
        notes: formData.notes,
      };

      let result;
      if (editingLead) {
        result = await whatsappService.updateLead(editingLead.id, data);
      } else {
        result = await whatsappService.createLead(data);
      }

      if (result.success) {
        alert(editingLead ? 'Lead atualizado' : 'Lead criado');
        setModalVisible(false);
        loadLeads();
      } else {
        alert(result.error || 'Erro ao salvar lead');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este lead?')) return;

    try {
      const result = await whatsappService.deleteLead(id);
      if (result.success) {
        alert('Lead deletado');
        loadLeads();
      } else {
        alert(result.error || 'Erro ao deletar lead');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar lead');
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'prospect':
        return COLORS.INFO;
      case 'qualified':
        return COLORS.PRIMARY;
      case 'proposal':
        return '#FF9800';
      case 'negotiation':
        return '#FFC107';
      case 'won':
        return COLORS.SUCCESS;
      case 'lost':
        return COLORS.DANGER;
      default:
        return COLORS.MUTED;
    }
  };

  const renderLeadItem = ({ item }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        marginHorizontal: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>
            {item.full_name}
          </Text>
          <View
            style={{
              backgroundColor: getStageColor(item.stage),
              paddingHorizontal: SPACING.sm,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: SPACING.sm,
            }}
          >
            <Text style={{ ...TYPOGRAPHY.CAPTION, color: '#fff' }}>
              {item.stage}
            </Text>
          </View>
        </View>
        {item.email && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED }}>
            {item.email}
          </Text>
        )}
        {item.whatsapp && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.SUCCESS, marginTop: SPACING.xs }}>
            📱 {item.whatsapp}
          </Text>
        )}
        {item.source && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>
            Origem: {item.source}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => handleEditLead(item)}
          style={{
            backgroundColor: COLORS.PRIMARY,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteLead(item.id)}
          style={{
            backgroundColor: COLORS.DANGER,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="delete" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.PRIMARY,
          padding: SPACING.lg,
          paddingTop: SPACING.xl,
        }}
      >
        <Text style={{ ...TYPOGRAPHY.HEADER, color: '#fff', marginBottom: SPACING.md }}>
          Leads
        </Text>

        {/* Search */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} />
          <TextInput
            placeholder="Buscar por nome ou email"
            value={searchText}
            onChangeText={setSearchText}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              marginLeft: SPACING.sm,
              ...TYPOGRAPHY.BODY,
            }}
          />
        </View>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="account-multiple" size={48} color={COLORS.MUTED} />
            <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>
              Nenhum lead encontrado
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateLead}
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.PRIMARY,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              flex: 1,
              marginTop: 50,
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={{ ...TYPOGRAPHY.HEADER, marginBottom: SPACING.lg }}>
                {editingLead ? 'Editar Lead' : 'Novo Lead'}
              </Text>

              {/* Nome */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Nome *</Text>
              <TextInput
                placeholder="Nome completo"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Email */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Email</Text>
              <TextInput
                placeholder="email@exemplo.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Telefone */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Telefone</Text>
              <TextInput
                placeholder="(11) 3000-0000"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* WhatsApp */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>WhatsApp</Text>
              <TextInput
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Origem */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Origem</Text>
              <TextInput
                placeholder="Website, indicação, etc"
                value={formData.source}
                onChangeText={(text) => setFormData({ ...formData, source: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Estágio */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Estágio</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  marginBottom: SPACING.md,
                }}
              >
                {LEAD_STAGES.map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    onPress={() => setFormData({ ...formData, stage })}
                    style={{
                      padding: SPACING.md,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.BORDER,
                      backgroundColor:
                        formData.stage === stage ? COLORS.PRIMARY + '20' : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        ...TYPOGRAPHY.BODY,
                        color: formData.stage === stage ? COLORS.PRIMARY : COLORS.MUTED,
                      }}
                    >
                      {stage}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Status</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  marginBottom: SPACING.md,
                }}
              >
                {LEAD_STATUS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFormData({ ...formData, status })}
                    style={{
                      padding: SPACING.md,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.BORDER,
                      backgroundColor:
                        formData.status === status ? COLORS.PRIMARY + '20' : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        ...TYPOGRAPHY.BODY,
                        color: formData.status === status ? COLORS.PRIMARY : COLORS.MUTED,
                      }}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notas */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Notas</Text>
              <TextInput
                placeholder="Observações sobre o lead"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Botões */}
              <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    padding: SPACING.md,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.BORDER,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: COLORS.MUTED }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveLead}
                  style={{
                    flex: 1,
                    padding: SPACING.md,
                    borderRadius: 8,
                    backgroundColor: COLORS.PRIMARY,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: '#fff' }}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
