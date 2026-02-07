import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import servicesService from '../services/servicesService';

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
  });

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const result = await servicesService.getServiceById(serviceId);
      if (result.success) {
        setService(result.data);
        setEditData({
          name: result.data?.name || '',
          description: result.data?.description || '',
          price: result.data?.price?.toString() || '',
          duration: result.data?.duration?.toString() || '',
          category: result.data?.category || '',
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateService = async () => {
    if (!editData.name.trim() || !editData.price) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    try {
      const result = await servicesService.updateService(serviceId, editData);

      if (result.success) {
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso');
        setShowEditModal(false);
        loadService();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar serviço');
    }
  };

  const handleDeleteService = () => {
    Alert.alert('Deletar Serviço', 'Tem certeza que deseja deletar este serviço?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            const result = await servicesService.deleteService(serviceId);
            if (result.success) {
              Alert.alert('Sucesso', 'Serviço deletado com sucesso');
              navigation.goBack();
            }
          } catch (error) {
            Alert.alert('Erro', 'Falha ao deletar serviço');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Serviço não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Service Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.serviceIcon}>
          <Ionicons name="briefcase" size={32} color="#fff" />
        </View>

        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>{service.category}</Text>
        </View>
      </View>

      {/* Service Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Descrição</Text>
          <Text style={styles.detailValue}>{service.description || 'Sem descrição'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Preço</Text>
          <Text style={styles.detailValue}>R$ {service.price || '0.00'}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duração</Text>
          <Text style={styles.detailValue}>{service.duration || '0'} minutos</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: service.is_active ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>{service.is_active ? 'Ativo' : 'Inativo'}</Text>
          </View>
        </View>
      </View>

      {/* Professionals */}
      {service.professionals && service.professionals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profissionais que oferecem</Text>
          {service.professionals.map((prof) => (
            <View key={prof.id} style={styles.professionalItem}>
              <View style={styles.professionalAvatar}>
                <Text style={styles.professionalAvatarText}>{prof.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.professionalInfo}>
                <Text style={styles.professionalName}>{prof.name}</Text>
                <Text style={styles.professionalSpecialty}>{prof.specialty}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Agendamentos</Text>
            <Text style={styles.statValue}>{service.total_appointments || '0'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Receita</Text>
            <Text style={styles.statValue}>R$ {service.total_revenue || '0.00'}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteService}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Deletar</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Serviço</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Nome do Serviço *"
                placeholderTextColor="#999"
                value={editData.name}
                onChangeText={(text) =>
                  setEditData({ ...editData, name: text })
                }
              />

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Descrição"
                placeholderTextColor="#999"
                multiline
                value={editData.description}
                onChangeText={(text) =>
                  setEditData({ ...editData, description: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Preço *"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={editData.price}
                onChangeText={(text) =>
                  setEditData({ ...editData, price: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Duração (minutos)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={editData.duration}
                onChangeText={(text) =>
                  setEditData({ ...editData, duration: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Categoria"
                placeholderTextColor="#999"
                value={editData.category}
                onChangeText={(text) =>
                  setEditData({ ...editData, category: text })
                }
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButtonModal]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButtonModal]}
                  onPress={handleUpdateService}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailItem: {
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
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  professionalItem: {
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
  professionalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  professionalSpecialty: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
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
  descriptionInput: {
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

export default ServiceDetailsScreen;
