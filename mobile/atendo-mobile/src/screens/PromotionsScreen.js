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
} from 'react-native';
import promotionsService from '../services/promotionsService';

const PromotionsScreen = ({ navigation }) => {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');

  const statuses = [
    { label: 'Todas', value: 'all' },
    { label: 'Ativas', value: 'active' },
    { label: 'Inativas', value: 'inactive' },
    { label: 'Expiradas', value: 'expired' },
  ];

  // Carregar promoções
  useEffect(() => {
    loadPromotions();
  }, [filterStatus]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const result = await promotionsService.getPromotions(filters);
      if (result.success) {
        setPromotions(result.data || []);
        applySearch(result.data || [], searchText);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar promoções');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de busca
  const applySearch = (data, query) => {
    if (!query.trim()) {
      setFilteredPromotions(data);
      return;
    }

    const filtered = data.filter(
      (promo) =>
        promo.name?.toLowerCase().includes(query.toLowerCase()) ||
        promo.code?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPromotions(filtered);
  };

  // Atualizar busca
  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(promotions, text);
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPromotions().finally(() => setRefreshing(false));
  }, [filterStatus]);

  // Renderizar item de promoção
  const renderPromotionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.promotionCard}
      onPress={() => navigation.navigate('PromotionDetails', { promotionId: item.id })}
    >
      <View style={styles.promotionHeader}>
        <View style={styles.promotionInfo}>
          <Text style={styles.promotionName}>{item.name}</Text>
          <Text style={styles.promotionCode}>Código: {item.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.promotionDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.promotionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Desconto</Text>
          <Text style={styles.discountValue}>
            {item.discount_type === 'percentage' ? `${item.discount_value}%` : `R$ ${item.discount_value}`}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Válido até</Text>
          <Text style={styles.detailValue}>
            {new Date(item.end_date).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Uso</Text>
          <Text style={styles.detailValue}>
            {item.used_count || 0}/{item.max_uses || '∞'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mínimo</Text>
          <Text style={styles.detailValue}>R$ {item.min_purchase || '0.00'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('PromotionDetails', { promotionId: item.id })}
      >
        <Text style={styles.actionButtonText}>Ver Detalhes →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      active: '#4CAF50',
      inactive: '#999',
      expired: '#F44336',
      scheduled: '#2196F3',
    };
    return colors[status] || '#999';
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      expired: 'Expirada',
      scheduled: 'Agendada',
    };
    return labels[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando promoções...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promoções</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar promoção ou código..."
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

      {/* Promotions List */}
      <FlatList
        data={filteredPromotions}
        renderItem={renderPromotionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma promoção encontrada</Text>
          </View>
        }
      />

      {/* Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePromotion')}
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
  promotionCard: {
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
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  promotionInfo: {
    flex: 1,
  },
  promotionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  promotionCode: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  promotionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  promotionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
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
});

export default PromotionsScreen;
