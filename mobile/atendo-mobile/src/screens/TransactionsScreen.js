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

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const types = [
    { label: 'Todas', value: 'all' },
    { label: 'Receita', value: 'income' },
    { label: 'Despesa', value: 'expense' },
    { label: 'Reembolso', value: 'refund' },
  ];

  const periods = [
    { label: 'Hoje', value: 'today' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
  ];

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, [filterType, selectedPeriod]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (filterType !== 'all') {
        filters.type = filterType;
      }

      if (selectedPeriod === 'today') {
        const today = new Date();
        filters.from = today.toISOString();
        filters.to = new Date(today.getTime() + 86400000).toISOString();
      } else if (selectedPeriod === 'week') {
        const today = new Date();
        filters.from = today.toISOString();
        filters.to = new Date(today.getTime() + 604800000).toISOString();
      } else if (selectedPeriod === 'year') {
        const today = new Date();
        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        filters.from = yearAgo.toISOString();
        filters.to = today.toISOString();
      }

      const result = await financialService.getTransactions(filters);
      if (result.success) {
        setTransactions(result.data || []);
        applySearch(result.data || [], searchText);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar transações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de busca
  const applySearch = (data, query) => {
    if (!query.trim()) {
      setFilteredTransactions(data);
      return;
    }

    const filtered = data.filter(
      (trans) =>
        trans.description?.toLowerCase().includes(query.toLowerCase()) ||
        trans.reference?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  // Atualizar busca
  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(transactions, text);
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions().finally(() => setRefreshing(false));
  }, [filterType, selectedPeriod]);

  // Renderizar item de transação
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeIconText}>{getTypeIcon(item.type)}</Text>
        </View>
      </View>

      <View style={styles.transactionMiddle}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
        {item.reference && (
          <Text style={styles.transactionReference}>{item.reference}</Text>
        )}
      </View>

      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: getAmountColor(item.type) }]}>
          {getAmountSign(item.type)}R$ {Math.abs(item.amount).toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Obter ícone do tipo
  const getTypeIcon = (type) => {
    const icons = {
      income: '📥',
      expense: '📤',
      refund: '↩️',
    };
    return icons[type] || '💰';
  };

  // Obter cor do tipo
  const getTypeColor = (type) => {
    const colors = {
      income: '#4CAF50',
      expense: '#F44336',
      refund: '#FF9800',
    };
    return colors[type] || '#999';
  };

  // Obter cor do valor
  const getAmountColor = (type) => {
    const colors = {
      income: '#4CAF50',
      expense: '#F44336',
      refund: '#FF9800',
    };
    return colors[type] || '#333';
  };

  // Obter sinal do valor
  const getAmountSign = (type) => {
    if (type === 'income') return '+';
    if (type === 'expense') return '-';
    if (type === 'refund') return '±';
    return '';
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      completed: '#4CAF50',
      pending: '#FFA500',
      failed: '#F44336',
      cancelled: '#999',
    };
    return colors[status] || '#999';
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Concluída',
      pending: 'Pendente',
      failed: 'Falha',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando transações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transações</Text>
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
          placeholder="Buscar transação..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {types.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterButton,
              filterType === type.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type.value && styles.filterButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma transação encontrada</Text>
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
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    marginRight: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconText: {
    fontSize: 24,
  },
  transactionMiddle: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionReference: {
    fontSize: 11,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});

export default TransactionsScreen;
