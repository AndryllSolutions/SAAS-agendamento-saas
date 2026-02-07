import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import whatsappService from '../services/whatsappService';

const WhatsAppMarketingScreen = ({ navigation }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');

  const statuses = [
    { label: 'Todas', value: 'all' },
    { label: 'Ativas', value: 'active' },
    { label: 'Pausadas', value: 'paused' },
    { label: 'Concluídas', value: 'completed' },
  ];

  // Carregar campanhas
  useEffect(() => {
    loadCampaigns();
  }, [filterStatus]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const result = await whatsappService.getWhatsappCampaigns(filters);
      if (result.success) {
        setCampaigns(result.data || []);
        applySearch(result.data || [], searchText);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar campanhas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de busca
  const applySearch = (data, query) => {
    if (!query.trim()) {
      setFilteredCampaigns(data);
      return;
    }

    const filtered = data.filter(
      (campaign) =>
        campaign.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCampaigns(filtered);
  };

  // Atualizar busca
  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(campaigns, text);
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCampaigns().finally(() => setRefreshing(false));
  }, [filterStatus]);

  // Criar campanha
  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !campaignMessage.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const result = await whatsappService.createWhatsappCampaign({
        name: campaignName,
        message: campaignMessage,
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Campanha criada com sucesso');
        setCampaignName('');
        setCampaignMessage('');
        setShowCreateModal(false);
        loadCampaigns();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar campanha');
    }
  };

  // Renderizar item de campanha
  const renderCampaignItem = ({ item }) => (
    <TouchableOpacity
      style={styles.campaignCard}
      onPress={() => navigation.navigate('CampaignDetails', { campaignId: item.id })}
    >
      <View style={styles.campaignHeader}>
        <View style={styles.campaignInfo}>
          <Text style={styles.campaignName}>{item.name}</Text>
          <Text style={styles.campaignDate}>
            {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.campaignMessage}>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      <View style={styles.campaignStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Enviadas</Text>
          <Text style={styles.statValue}>{item.sent_count || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Entregues</Text>
          <Text style={styles.statValue}>{item.delivered_count || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lidas</Text>
          <Text style={styles.statValue}>{item.read_count || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Respostas</Text>
          <Text style={styles.statValue}>{item.replies_count || 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('CampaignDetails', { campaignId: item.id })}
      >
        <Text style={styles.actionButtonText}>Ver Detalhes →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      active: '#4CAF50',
      paused: '#FFA500',
      completed: '#2196F3',
      draft: '#999',
    };
    return colors[status] || '#999';
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      draft: 'Rascunho',
    };
    return labels[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando campanhas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WhatsApp Marketing</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar campanha..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterButton,
              filterStatus === status.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status.value && styles.filterButtonTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Campaigns List */}
      <FlatList
        data={filteredCampaigns}
        renderItem={renderCampaignItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma campanha encontrada</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Campanha</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da campanha"
              placeholderTextColor="#999"
              value={campaignName}
              onChangeText={setCampaignName}
            />

            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Mensagem (use {{nome}} para personalização)"
              placeholderTextColor="#999"
              multiline
              value={campaignMessage}
              onChangeText={setCampaignMessage}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateCampaign}
              >
                <Text style={styles.modalButtonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  campaignDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  campaignMessage: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 12,
    color: '#333',
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  actionButton: {
    backgroundColor: '#0066cc',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default WhatsAppMarketingScreen;
