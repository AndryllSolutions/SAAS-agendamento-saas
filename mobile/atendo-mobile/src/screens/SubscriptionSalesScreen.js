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
import subscriptionService from '../services/subscriptionService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const SUBSCRIPTION_STATUS = ['active', 'paused', 'cancelled', 'expired'];

export default function SubscriptionSalesScreen() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [formData, setFormData] = useState({
    client_crm_id: '',
    model_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [searchText, subscriptions]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const result = await subscriptionService.getSubscriptionSales({ limit: 100 });
      if (result.success) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const filterSubscriptions = () => {
    if (!searchText) {
      setFilteredSubscriptions(subscriptions);
      return;
    }

    const filtered = subscriptions.filter(
      (sub) =>
        sub.id?.toString().includes(searchText) ||
        sub.client_crm_id?.toString().includes(searchText)
    );
    setFilteredSubscriptions(filtered);
  };

  const handleCreateSubscription = () => {
    setEditingSubscription(null);
    setFormData({
      client_crm_id: '',
      model_id: '',
      start_date: '',
      end_date: '',
    });
    setModalVisible(true);
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      client_crm_id: subscription.client_crm_id?.toString() || '',
      model_id: subscription.model_id?.toString() || '',
      start_date: subscription.start_date?.split('T')[0] || '',
      end_date: subscription.end_date?.split('T')[0] || '',
    });
    setModalVisible(true);
  };

  const handleSaveSubscription = async () => {
    try {
      if (!formData.client_crm_id || !formData.model_id || !formData.start_date) {
        alert('Cliente, modelo e data de início são obrigatórios');
        return;
      }

      const data = {
        client_crm_id: parseInt(formData.client_crm_id),
        model_id: parseInt(formData.model_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      let result;
      if (editingSubscription) {
        result = await subscriptionService.updateSubscriptionSale(editingSubscription.id, data);
      } else {
        result = await subscriptionService.createSubscriptionSale(data);
      }

      if (result.success) {
        alert(editingSubscription ? 'Assinatura atualizada' : 'Assinatura criada');
        setModalVisible(false);
        loadSubscriptions();
      } else {
        alert(result.error || 'Erro ao salvar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar assinatura');
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta assinatura?')) return;

    try {
      const result = await subscriptionService.deleteSubscriptionSale(id);
      if (result.success) {
        alert('Assinatura deletada');
        loadSubscriptions();
      } else {
        alert(result.error || 'Erro ao deletar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar assinatura');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.SUCCESS;
      case 'paused':
        return COLORS.WARNING;
      case 'cancelled':
      case 'expired':
        return COLORS.DANGER;
      default:
        return COLORS.MUTED;
    }
  };

  const renderSubscriptionItem = ({ item }) => (
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
            Assinatura #{item.id}
          </Text>
          <View
            style={{
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: SPACING.sm,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: SPACING.sm,
            }}
          >
            <Text style={{ ...TYPOGRAPHY.CAPTION, color: '#fff' }}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED }}>
          Cliente: {item.client_crm_id}
        </Text>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>
          Modelo: {item.model_id}
        </Text>
        {item.start_date && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>
            Início: {new Date(item.start_date).toLocaleDateString('pt-BR')}
          </Text>
        )}
        {item.next_payment_date && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.SUCCESS, marginTop: SPACING.xs }}>
            Próximo pagamento: {new Date(item.next_payment_date).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => handleEditSubscription(item)}
          style={{
            backgroundColor: COLORS.PRIMARY,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteSubscription(item.id)}
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
          Vendas por Assinatura
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
            placeholder="Buscar por ID ou cliente"
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

      {/* Subscriptions List */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="calendar-repeat" size={48} color={COLORS.MUTED} />
            <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>
              Nenhuma assinatura encontrada
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateSubscription}
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
                {editingSubscription ? 'Editar Assinatura' : 'Nova Assinatura'}
              </Text>

              {/* Cliente ID */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>ID do Cliente *</Text>
              <TextInput
                placeholder="ID do cliente"
                value={formData.client_crm_id}
                onChangeText={(text) => setFormData({ ...formData, client_crm_id: text })}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Modelo ID */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>ID do Modelo *</Text>
              <TextInput
                placeholder="ID do modelo de assinatura"
                value={formData.model_id}
                onChangeText={(text) => setFormData({ ...formData, model_id: text })}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Data de Início */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Data de Início *</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formData.start_date}
                onChangeText={(text) => setFormData({ ...formData, start_date: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Data de Término */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Data de Término</Text>
              <TextInput
                placeholder="YYYY-MM-DD (opcional)"
                value={formData.end_date}
                onChangeText={(text) => setFormData({ ...formData, end_date: text })}
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
                  onPress={handleSaveSubscription}
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
