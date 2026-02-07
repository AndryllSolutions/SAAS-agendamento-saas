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
} from 'react-native';
import reportsService from '../services/reportsService';

const ReportsScreen = ({ navigation }) => {
  const [reportsSummary, setReportsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
    { label: 'Ano', value: 'year' },
  ];

  const reports = [
    {
      id: 'dre',
      title: 'DRE (Demonstração de Resultado)',
      description: 'Receita, despesas e lucro',
      icon: '📊',
      color: '#0066cc',
    },
    {
      id: 'revenue',
      title: 'Receita',
      description: 'Análise de receita por período',
      icon: '💰',
      color: '#4CAF50',
    },
    {
      id: 'expenses',
      title: 'Despesas',
      description: 'Análise de despesas por categoria',
      icon: '💸',
      color: '#F44336',
    },
    {
      id: 'by-service',
      title: 'Por Serviço',
      description: 'Receita e volume por serviço',
      icon: '🛠️',
      color: '#FF9800',
    },
    {
      id: 'by-professional',
      title: 'Por Profissional',
      description: 'Desempenho por profissional',
      icon: '👥',
      color: '#2196F3',
    },
    {
      id: 'by-client',
      title: 'Por Cliente',
      description: 'Receita e frequência por cliente',
      icon: '👤',
      color: '#9C27B0',
    },
    {
      id: 'appointments',
      title: 'Agendamentos',
      description: 'Análise de agendamentos',
      icon: '📅',
      color: '#00BCD4',
    },
    {
      id: 'goals',
      title: 'Metas',
      description: 'Acompanhamento de metas',
      icon: '🎯',
      color: '#FFC107',
    },
  ];

  // Carregar resumo de relatórios
  useEffect(() => {
    loadReportsSummary();
  }, [selectedPeriod]);

  const loadReportsSummary = async () => {
    try {
      setLoading(true);
      const filters = {};

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

      const result = await reportsService.getReportsSummary(filters);
      if (result.success) {
        setReportsSummary(result.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar resumo de relatórios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReportsSummary().finally(() => setRefreshing(false));
  }, [selectedPeriod]);

  // Renderizar item de relatório
  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { reportType: item.id, period: selectedPeriod })}
    >
      <View style={[styles.reportIcon, { backgroundColor: item.color }]}>
        <Text style={styles.reportIconText}>{item.icon}</Text>
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDescription}>{item.description}</Text>
      </View>
      <Text style={styles.reportArrow}>→</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando relatórios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios</Text>
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

      {/* Summary Stats */}
      {reportsSummary && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryContainer}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Receita Total</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              R$ {reportsSummary.total_revenue || '0.00'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despesa Total</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
              R$ {reportsSummary.total_expenses || '0.00'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Lucro Líquido</Text>
            <Text style={[styles.summaryValue, { color: '#0066cc' }]}>
              R$ {reportsSummary.net_profit || '0.00'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Margem</Text>
            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
              {reportsSummary.profit_margin || '0'}%
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
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
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reportCard: {
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
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportIconText: {
    fontSize: 24,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reportDescription: {
    fontSize: 12,
    color: '#666',
  },
  reportArrow: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: 'bold',
  },
});

export default ReportsScreen;
