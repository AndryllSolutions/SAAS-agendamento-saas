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
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform,
} from 'react-native';
import goalsService from '../services/goalsService';

const GoalsScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
    { label: 'Ano', value: 'year' },
  ];

  // Carregar metas
  useEffect(() => {
    loadGoals();
  }, [selectedPeriod]);

  const loadGoals = async () => {
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

      const result = await goalsService.getGoals(filters);
      if (result.success) {
        setGoals(result.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar metas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals().finally(() => setRefreshing(false));
  }, [selectedPeriod]);

  // Renderizar item de meta
  const renderGoalItem = ({ item }) => {
    const progress = item.target > 0 ? (item.current / item.target) * 100 : 0;
    const isCompleted = progress >= 100;
    const isBehind = progress < 50;

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text style={styles.goalPeriod}>
              {new Date(item.start_date).toLocaleDateString('pt-BR')} - {new Date(item.end_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={[styles.progressBadge, { backgroundColor: isCompleted ? '#4CAF50' : isBehind ? '#F44336' : '#FFA500' }]}>
            <Text style={styles.progressBadgeText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <View style={styles.goalProgress}>
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

        <View style={styles.goalStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Meta</Text>
            <Text style={styles.statValue}>R$ {item.target || '0.00'}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Atual</Text>
            <Text style={[styles.statValue, { color: isCompleted ? '#4CAF50' : isBehind ? '#F44336' : '#FFA500' }]}>
              R$ {item.current || '0.00'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Faltam</Text>
            <Text style={styles.statValue}>R$ {Math.max(0, item.target - item.current) || '0.00'}</Text>
          </View>
        </View>

        {item.responsible && (
          <View style={styles.responsibleSection}>
            <Text style={styles.responsibleLabel}>Responsável:</Text>
            <Text style={styles.responsibleName}>{item.responsible}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
        >
          <Text style={styles.actionButtonText}>Ver Detalhes →</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando metas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Metas</Text>
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

      {/* Goals List */}
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhuma meta encontrada</Text>
          </View>
        }
      />

      {/* Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGoal')}
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  goalPeriod: {
    fontSize: 12,
    color: '#666',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  progressBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
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
    color: '#333',
  },
  responsibleSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  responsibleLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  responsibleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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

export default GoalsScreen;
