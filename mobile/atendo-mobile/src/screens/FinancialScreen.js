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
} from 'react-native';
import financialService from '../services/financialService';

const FinancialScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { label: 'Hoje', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
  ];

  // Carregar resumo financeiro
  useEffect(() => {
    loadFinancialSummary();
  }, [selectedPeriod]);

  const loadFinancialSummary = async () => {
    try {
      setLoading(true);
      const result = await financialService.getFinancialSummary({
        period: selectedPeriod,
      });

      if (result.success) {
        setSummary(result.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados financeiros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFinancialSummary().finally(() => setRefreshing(false));
  }, [selectedPeriod]);

  // Renderizar card de estatística
  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando dados financeiros...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financeiro</Text>
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

      {/* Main Stats */}
      <View style={styles.statsContainer}>
        {renderStatCard('Receita', `R$ ${summary?.revenue || '0.00'}`, '💰', '#4CAF50')}
        {renderStatCard('Despesas', `R$ ${summary?.expenses || '0.00'}`, '💸', '#F44336')}
        {renderStatCard('Lucro', `R$ ${summary?.profit || '0.00'}`, '📈', '#0066cc')}
        {renderStatCard('Comissões', `R$ ${summary?.commissions || '0.00'}`, '👥', '#FF9800')}
      </View>

      {/* Financial Modules */}
      <View style={styles.modulesContainer}>
        <Text style={styles.modulesTitle}>Módulos Financeiros</Text>

        {/* Transactions */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Transactions')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>📊</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Transações</Text>
            <Text style={styles.moduleDescription}>Histórico de todas as transações</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Payments */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Payments')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>💳</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Pagamentos</Text>
            <Text style={styles.moduleDescription}>Gerenciar pagamentos e cobranças</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Commissions */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Commissions')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>👥</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Comissões</Text>
            <Text style={styles.moduleDescription}>Comissões por profissional</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Cash Control */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('CashControl')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>🏦</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Controle de Caixa</Text>
            <Text style={styles.moduleDescription}>Abrir e fechar caixa</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Invoices */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Invoices')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>📄</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Notas Fiscais</Text>
            <Text style={styles.moduleDescription}>Gerar e gerenciar notas fiscais</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Reports */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>📈</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Relatórios</Text>
            <Text style={styles.moduleDescription}>DRE, receita, despesas e mais</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>

        {/* Goals */}
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Goals')}
        >
          <View style={styles.moduleIcon}>
            <Text style={styles.moduleIconText}>🎯</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleName}>Metas</Text>
            <Text style={styles.moduleDescription}>Definir e acompanhar metas</Text>
          </View>
          <Text style={styles.moduleArrow}>→</Text>
        </TouchableOpacity>
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
  periodContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modulesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  moduleCard: {
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
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIconText: {
    fontSize: 24,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#666',
  },
  moduleArrow: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: 'bold',
  },
});

export default FinancialScreen;
