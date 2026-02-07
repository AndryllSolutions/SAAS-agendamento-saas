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
import evaluationsService from '../services/evaluationsService';

const EvaluationsScreen = ({ navigation }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    appointment_id: '',
    rating: '5',
    comment: '',
  });

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: '⭐⭐⭐⭐⭐ 5 Estrelas', value: '5' },
    { label: '⭐⭐⭐⭐ 4 Estrelas', value: '4' },
    { label: '⭐⭐⭐ 3 Estrelas', value: '3' },
    { label: '⭐⭐ 2 Estrelas', value: '2' },
    { label: '⭐ 1 Estrela', value: '1' },
  ];

  // Carregar avaliações
  useEffect(() => {
    loadEvaluations();
  }, [selectedFilter]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const filters = selectedFilter !== 'all' ? { rating: parseInt(selectedFilter) } : {};
      const result = await evaluationsService.getEvaluations({
        limit: 100,
        ...filters,
      });
      if (result.success) {
        setEvaluations(result.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar avaliações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvaluations().finally(() => setRefreshing(false));
  }, [selectedFilter]);

  // Criar avaliação
  const handleCreateEvaluation = async () => {
    if (!newEvaluation.comment.trim()) {
      Alert.alert('Erro', 'Preencha o comentário');
      return;
    }

    try {
      const result = await evaluationsService.createEvaluation(newEvaluation);

      if (result.success) {
        Alert.alert('Sucesso', 'Avaliação criada com sucesso');
        setShowCreateModal(false);
        setNewEvaluation({
          appointment_id: '',
          rating: '5',
          comment: '',
        });
        loadEvaluations();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar avaliação');
    }
  };

  // Renderizar estrelas
  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFB800' : '#ddd'}
          />
        ))}
      </View>
    );
  };

  // Renderizar item de avaliação
  const renderEvaluationItem = ({ item }) => (
    <View style={styles.evaluationCard}>
      <View style={styles.evaluationHeader}>
        <View style={styles.evaluationInfo}>
          <Text style={styles.evaluationClient}>{item.client_name}</Text>
          <Text style={styles.evaluationService}>{item.service_name}</Text>
        </View>
        <Text style={styles.evaluationDate}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.starsSection}>
        {renderStars(item.rating)}
      </View>

      <Text style={styles.evaluationComment}>{item.comment}</Text>

      {item.response && (
        <View style={styles.responseCard}>
          <Text style={styles.responseLabel}>Resposta do estabelecimento:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
    </View>
  );

  // Calcular média de avaliações
  const calculateAverageRating = () => {
    if (evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, eval) => acc + (eval.rating || 0), 0);
    return (sum / evaluations.length).toFixed(1);
  };

  // Contar avaliações por estrela
  const countByRating = (rating) => {
    return evaluations.filter((eval) => eval.rating === rating).length;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando avaliações...</Text>
      </View>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Avaliações</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingValue}>{averageRating}</Text>
            <Text style={styles.ratingLabel}>/ 5.0</Text>
          </View>

          <View style={styles.ratingStats}>
            <Text style={styles.statsTitle}>Baseado em {evaluations.length} avaliações</Text>

            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.statRow}>
                <Text style={styles.statLabel}>{star} ⭐</Text>
                <View style={styles.statBar}>
                  <View
                    style={[
                      styles.statBarFill,
                      {
                        width: `${
                          evaluations.length > 0
                            ? (countByRating(star) / evaluations.length) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statCount}>{countByRating(star)}</Text>
              </View>
            ))}
          </View>
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

        {/* Evaluations List */}
        <View style={styles.listContainer}>
          {evaluations.length > 0 ? (
            <FlatList
              data={evaluations}
              renderItem={renderEvaluationItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Nenhuma avaliação encontrada</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Nova Avaliação</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.modalLabel}>Classificação</Text>
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      setNewEvaluation({ ...newEvaluation, rating: star.toString() })
                    }
                  >
                    <Ionicons
                      name={star <= parseInt(newEvaluation.rating) ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= parseInt(newEvaluation.rating) ? '#FFB800' : '#ddd'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Comentário</Text>
              <TextInput
                style={[styles.input, styles.commentInput]}
                placeholder="Compartilhe sua experiência..."
                placeholderTextColor="#999"
                multiline
                value={newEvaluation.comment}
                onChangeText={(text) =>
                  setNewEvaluation({ ...newEvaluation, comment: text })
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
                  onPress={handleCreateEvaluation}
                >
                  <Text style={styles.modalButtonText}>Enviar</Text>
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
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingStats: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#333',
    width: 30,
  },
  statBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  statCount: {
    fontSize: 11,
    color: '#666',
    width: 20,
    textAlign: 'right',
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
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  evaluationCard: {
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
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  evaluationInfo: {
    flex: 1,
  },
  evaluationClient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  evaluationService: {
    fontSize: 12,
    color: '#666',
  },
  evaluationDate: {
    fontSize: 11,
    color: '#999',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  starsSection: {
    marginBottom: 8,
  },
  evaluationComment: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  responseCard: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
    borderRadius: 4,
    padding: 8,
  },
  responseLabel: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '600',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 16,
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
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  },
  commentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
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

export default EvaluationsScreen;
