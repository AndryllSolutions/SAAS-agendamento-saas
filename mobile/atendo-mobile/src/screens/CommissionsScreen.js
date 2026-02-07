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
import financialService from '../services/financialService';

const CommissionsScreen = ({ navigation }) => {
  const [commissions, setCommissions] = useState([]);
  const [filteredCommissions, setFilteredCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const statuses = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendente', value: 'pending' },
    { label: 'Paga', value: 'paid' },
    { label: 'Atrasada', value: 'overdue' },
  ];

  const periods = [
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
    { label: 'Ano', value: 'year' },
  ];

  // Carregar comissões
  useEffect(() => {
    loadCommissions();
  }, [filterStatus, selectedPeriod]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      if (selectedPeriod === 'week') {
        const today = new Date();
        filters.from = new Date(today.getTime() - 604800000).toISOString();
        filters.to = today.toISOString();
      } else if (selectedPeriod === 'quarter') {
        const today = new Date();
        filters.from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString();
        filters.to = today.toISOString();
      } else if (selectedPeriod === 'year') {
        const today = new Date();
        filters.from = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString();
        filters.to = today.toISOString();
      }

      const result = await financialService.getCommissions(filters);
      if (result.success) {
        setCommissions(result.data || []);
        applySearch(result.data || [], searchText);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar comissões');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de busca
  const applySearch = (data, query) => {
    if (!query.trim()) {
      setFilteredCommissions(data);
      return;
    }

    const filtered = data.filter(
      (comm) =>
        comm.professional_name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCommissions(filtered);
  };

  // Atualizar busca
  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(commissions, text);
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCommissions().finally(() => setRefreshing(false));
  }, [filterStatus, selectedPeriod]);

  // Renderizar item de comissão
  const renderCommissionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.commissionCard}
      onPress={() => navigation.navigate('CommissionDetails', { commissionId: item.id })}
    >
      <View style={styles.commissionHeader}>
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.professional_name}</Text>
          <Text style={styles.professionalRole}>{item.professional_role}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.commissionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Período:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.period_start).toLocaleDateString('pt-BR')} - {new Date(item.period_end).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Serviços:</Text>
          <Text style={styles.detailValue}>{item.services_count || 0}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valor Base:</Text>
          <Text style={styles.detailValue}>R$ {item.base_amount || '0.00'}</Text>
        </View>
        {item.bonus && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bônus:</Text>
            <Text style={styles.bonusValue}>+R$ {item.bonus}</Text>
          </View>
        )}
      </View>

      <View style={styles.commissionFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>R$ {item.total_amount || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      paid: '#4CAF50',
      overdue: '#F44336',
      processing: '#2196F3',
    };
    return colors[status] || '#999';
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      paid: 'Paga',
      overdue: 'Atrasada',
      processing: 'Processando',
    };
    return labels[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando comissões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comissões</Text>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodContainer}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.value)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.value && styles.periodButtonTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar profissional..."
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

      {/* Commissions List */}
      <FlatList
        data={filteredCommissions}
        renderItem={renderCommissionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma comissão encontrada</Text>
          </View>
        }
      />
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
  periodContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  periodButtonActive: {
    backgroundColor: '#0066cc',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  periodButtonTextActive: {
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
  commissionCard: {
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
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  professionalRole: {
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
  commissionDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  bonusValue: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  commissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});

export default CommissionsScreen;
