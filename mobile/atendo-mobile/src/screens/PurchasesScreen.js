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
import { Ionicons } from '@expo/vector-icons';
import purchasesService from '../services/purchasesService';

const PurchasesScreen = ({ navigation }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    product_name: '',
    supplier_id: '',
    quantity: '',
    unit_price: '',
    total_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Recebidas', value: 'received' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  // Carregar compras
  useEffect(() => {
    loadPurchases();
  }, [selectedFilter]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const filters = selectedFilter !== 'all' ? { status: selectedFilter } : {};
      const result = await purchasesService.getPurchases({
        limit: 100,
        ...filters,
      });
      if (result.success) {
        setPurchases(result.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar compras');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPurchases().finally(() => setRefreshing(false));
  }, [selectedFilter]);

  // Criar compra
  const handleCreatePurchase = async () => {
    if (!newPurchase.product_name.trim() || !newPurchase.quantity || !newPurchase.unit_price) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const result = await purchasesService.createPurchase(newPurchase);

      if (result.success) {
        Alert.alert('Sucesso', 'Compra criada com sucesso');
        setShowCreateModal(false);
        setNewPurchase({
          product_name: '',
          supplier_id: '',
          quantity: '',
          unit_price: '',
          total_price: '',
          purchase_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        loadPurchases();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar compra');
    }
  };

  // Renderizar item de compra
  const renderPurchaseItem = ({ item }) => {
    const getStatusColor = (status) => {
      const colors = {
        pending: '#FFA500',
        received: '#4CAF50',
        cancelled: '#F44336',
      };
      return colors[status] || '#999';
    };

    const getStatusLabel = (status) => {
      const labels = {
        pending: 'Pendente',
        received: 'Recebida',
        cancelled: 'Cancelada',
      };
      return labels[status] || status;
    };

    return (
      <TouchableOpacity
        style={styles.purchaseCard}
        onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id })}
      >
        <View style={styles.purchaseHeader}>
          <View style={styles.purchaseInfo}>
            <Text style={styles.purchaseProduct}>{item.product_name}</Text>
            <Text style={styles.purchaseSupplier}>{item.supplier_name}</Text>
          </View>
          <View style={[styles.purchaseStatus, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.purchaseStatusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.purchaseDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Quantidade</Text>
            <Text style={styles.detailValue}>{item.quantity} un</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Valor Unit.</Text>
            <Text style={styles.detailValue}>R$ {item.unit_price || '0.00'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>R$ {item.total_price || '0.00'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Data</Text>
            <Text style={styles.detailValue}>
              {new Date(item.purchase_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando compras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compras</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Purchases List */}
      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma compra encontrada</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Compra</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Nome do Produto *"
                placeholderTextColor="#999"
                value={newPurchase.product_name}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, product_name: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Quantidade *"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={newPurchase.quantity}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, quantity: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Preço Unitário *"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={newPurchase.unit_price}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, unit_price: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Preço Total"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={newPurchase.total_price}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, total_price: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Data da Compra"
                placeholderTextColor="#999"
                value={newPurchase.purchase_date}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, purchase_date: text })
                }
              />

              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Observações"
                placeholderTextColor="#999"
                multiline
                value={newPurchase.notes}
                onChangeText={(text) =>
                  setNewPurchase({ ...newPurchase, notes: text })
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButtonModal]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButtonModal]}
                  onPress={handleCreatePurchase}
                >
                  <Text style={styles.modalButtonText}>Criar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  purchaseCard: {
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
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  purchaseSupplier: {
    fontSize: 12,
    color: '#666',
  },
  purchaseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  purchaseStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  purchaseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '48%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 16,
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
  notesInput: {
    minHeight: 80,
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
  cancelButtonModal: {
    backgroundColor: '#f0f0f0',
  },
  confirmButtonModal: {
    backgroundColor: '#0066cc',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PurchasesScreen;
