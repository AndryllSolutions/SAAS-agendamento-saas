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
  ProgressViewIOS,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import cashbackService from '../services/cashbackService';

const CashbackScreen = ({ navigation }) => {
  const [cashbackData, setCashbackData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados de cashback
  useEffect(() => {
    loadCashbackData();
  }, []);

  const loadCashbackData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transactionsRes] = await Promise.all([
        cashbackService.getCashbackSummary(),
        cashbackService.getCashbackTransactions({ limit: 50 }),
      ]);

      if (summaryRes.success) {
        setCashbackData(summaryRes.data);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados de cashback');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCashbackData().finally(() => setRefreshing(false));
  }, []);

  // Renderizar item de transação
  const renderTransactionItem = ({ item }) => {
    const isCredit = item.type === 'credit';

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIcon}>
          <Ionicons
            name={isCredit ? 'add-circle' : 'remove-circle'}
            size={24}
            color={isCredit ? '#4CAF50' : '#F44336'}
          />
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <Text style={[styles.transactionAmount, { color: isCredit ? '#4CAF50' : '#F44336' }]}>
          {isCredit ? '+' : '-'} R$ {item.amount || '0.00'}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando cashback...</Text>
      </View>
    );
  }

  const progress = cashbackData?.total_balance > 0
    ? (cashbackData?.current_balance / cashbackData?.total_balance) * 100
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cashback</Text>
      </View>

      {/* Cashback Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Saldo de Cashback</Text>
          <Ionicons name="gift" size={24} color="#0066cc" />
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Disponível</Text>
          <Text style={styles.balanceAmount}>R$ {cashbackData?.current_balance || '0.00'}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Meta do Período</Text>
            <Text style={styles.progressValue}>
              R$ {cashbackData?.current_balance || '0.00'} / R$ {cashbackData?.total_balance || '0.00'}
            </Text>
          </View>

          {Platform.OS === 'android' ? (
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={progress / 100}
              color="#0066cc"
              style={styles.progressBar}
            />
          ) : (
            <ProgressViewIOS
              progress={progress / 100}
              progressTintColor="#0066cc"
              style={styles.progressBar}
            />
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Taxa</Text>
            <Text style={styles.statValue}>{cashbackData?.percentage || '0'}%</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Período</Text>
            <Text style={styles.statValue}>{cashbackData?.period || 'Mensal'}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {cashbackData?.is_active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.redeemButton]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Resgatar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.historyButton]}>
          <Ionicons name="list" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
        </View>

        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma transação encontrada</Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Ionicons name="information-circle" size={20} color="#0066cc" />
          <Text style={styles.infoText}>
            Você acumula cashback a cada compra realizada. Resgate quando atingir o saldo mínimo.
          </Text>
        </View>
      </View>
    </ScrollView>
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
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
  },
  historyButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
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
  infoCard: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    padding: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 16,
  },
});

export default CashbackScreen;
