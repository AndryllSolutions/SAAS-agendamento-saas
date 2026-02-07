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
import anamnesesService from '../services/anamnesesService';

const AnamnesesScreen = ({ navigation }) => {
  const [anamneses, setAnamneses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnamnesis, setNewAnamnesis] = useState({
    client_id: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Carregar anamneses
  useEffect(() => {
    loadAnamneses();
  }, []);

  const loadAnamneses = async () => {
    try {
      setLoading(true);
      const result = await anamnesesService.getAnamneses({
        limit: 100,
        search: searchText,
      });
      if (result.success) {
        setAnamneses(result.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar anamneses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnamneses().finally(() => setRefreshing(false));
  }, [searchText]);

  // Criar anamnese
  const handleCreateAnamnesis = async () => {
    if (!newAnamnesis.title.trim() || !newAnamnesis.content.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const result = await anamnesesService.createAnamnesis(newAnamnesis);

      if (result.success) {
        Alert.alert('Sucesso', 'Anamnese criada com sucesso');
        setShowCreateModal(false);
        setNewAnamnesis({
          client_id: '',
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
        });
        loadAnamneses();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar anamnese');
    }
  };

  // Renderizar item de anamnese
  const renderAnamnesisItem = ({ item }) => (
    <TouchableOpacity
      style={styles.anamnesisCard}
      onPress={() => navigation.navigate('AnamnesisDetails', { anamnesisId: item.id })}
    >
      <View style={styles.anamnesisHeader}>
        <View style={styles.anamnesisInfo}>
          <Text style={styles.anamnesisTitle}>{item.title}</Text>
          <Text style={styles.anamnesisClient}>{item.client_name}</Text>
        </View>
        <Text style={styles.anamnesisDate}>
          {new Date(item.date).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <Text style={styles.anamnesisContent} numberOfLines={2}>
        {item.content}
      </Text>

      <View style={styles.anamnesisFooter}>
        <View style={styles.anamnesisTag}>
          <Text style={styles.anamnesisTagText}>{item.category || 'Geral'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando anamneses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anamneses</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente ou título..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            loadAnamneses();
          }}
        />
      </View>

      {/* Anamneses List */}
      <FlatList
        data={anamneses}
        renderItem={renderAnamnesisItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma anamnese encontrada</Text>
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
              <Text style={styles.modalTitle}>Nova Anamnese</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Título"
                placeholderTextColor="#999"
                value={newAnamnesis.title}
                onChangeText={(text) =>
                  setNewAnamnesis({ ...newAnamnesis, title: text })
                }
              />

              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="Conteúdo da anamnese..."
                placeholderTextColor="#999"
                multiline
                value={newAnamnesis.content}
                onChangeText={(text) =>
                  setNewAnamnesis({ ...newAnamnesis, content: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Data (YYYY-MM-DD)"
                placeholderTextColor="#999"
                value={newAnamnesis.date}
                onChangeText={(text) =>
                  setNewAnamnesis({ ...newAnamnesis, date: text })
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
                  onPress={handleCreateAnamnesis}
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
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  anamnesisCard: {
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
  anamnesisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  anamnesisInfo: {
    flex: 1,
  },
  anamnesisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  anamnesisClient: {
    fontSize: 12,
    color: '#666',
  },
  anamnesisDate: {
    fontSize: 12,
    color: '#999',
  },
  anamnesisContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  anamnesisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anamnesisTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  anamnesisTagText: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '600',
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
  contentInput: {
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

export default AnamnesesScreen;
