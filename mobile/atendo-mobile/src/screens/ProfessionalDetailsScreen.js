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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import professionalsService from '../services/professionalsService';

const ProfessionalDetailsScreen = ({ route, navigation }) => {
  const { professionalId } = route.params;
  const [professional, setProfessional] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
  });

  useEffect(() => {
    loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      setLoading(true);
      const [profRes, schedRes] = await Promise.all([
        professionalsService.getProfessionalById(professionalId),
        professionalsService.getProfessionalSchedule(professionalId),
      ]);

      if (profRes.success) {
        setProfessional(profRes.data);
        setEditData({
          name: profRes.data?.name || '',
          email: profRes.data?.email || '',
          phone: profRes.data?.phone || '',
          specialty: profRes.data?.specialty || '',
          bio: profRes.data?.bio || '',
        });
      }

      if (schedRes.success) {
        setSchedule(schedRes.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar profissional');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfessional = async () => {
    if (!editData.name.trim() || !editData.email.trim()) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    try {
      const result = await professionalsService.updateProfessional(professionalId, editData);

      if (result.success) {
        Alert.alert('Sucesso', 'Profissional atualizado com sucesso');
        setShowEditModal(false);
        loadProfessional();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar profissional');
    }
  };

  const handleDeleteProfessional = () => {
    Alert.alert('Deletar Profissional', 'Tem certeza que deseja deletar este profissional?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            const result = await professionalsService.deleteProfessional(professionalId);
            if (result.success) {
              Alert.alert('Sucesso', 'Profissional deletado com sucesso');
              navigation.goBack();
            }
          } catch (error) {
            Alert.alert('Erro', 'Falha ao deletar profissional');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleDay}>
        <Text style={styles.scheduleDayText}>{item.day}</Text>
      </View>

      <View style={styles.scheduleTime}>
        <Text style={styles.scheduleTimeText}>
          {item.start_time} - {item.end_time}
        </Text>
      </View>

      <View style={[styles.scheduleStatus, { backgroundColor: item.is_active ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.scheduleStatusText}>{item.is_active ? 'Ativo' : 'Inativo'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profissional não encontrado</Text>
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
        <Text style={styles.headerTitle}>Detalhes do Profissional</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Professional Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.professionalAvatar}>
          <Text style={styles.professionalAvatarText}>{professional.name?.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{professional.name}</Text>
          <Text style={styles.professionalSpecialty}>{professional.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{professional.rating || '0.0'} / 5.0</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações de Contato</Text>

        <View style={styles.contactItem}>
          <Ionicons name="mail" size={20} color="#0066cc" />
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{professional.email}</Text>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="call" size={20} color="#0066cc" />
          <View style={styles.contactContent}>
            <Text style={styles.contactLabel}>Telefone</Text>
            <Text style={styles.contactValue}>{professional.phone || 'Não informado'}</Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      {professional.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{professional.bio}</Text>
          </View>
        </View>
      )}

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horários de Atendimento</Text>
        {schedule.length > 0 ? (
          <FlatList
            data={schedule}
            renderItem={renderScheduleItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum horário configurado</Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Agendamentos</Text>
            <Text style={styles.statValue}>{professional.total_appointments || '0'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Clientes</Text>
            <Text style={styles.statValue}>{professional.total_clients || '0'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avaliação</Text>
            <Text style={styles.statValue}>{professional.rating || '0.0'}</Text>
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
          onPress={handleDeleteProfessional}
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
              <Text style={styles.modalTitle}>Editar Profissional</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Nome *"
                placeholderTextColor="#999"
                value={editData.name}
                onChangeText={(text) =>
                  setEditData({ ...editData, name: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Email *"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={editData.email}
                onChangeText={(text) =>
                  setEditData({ ...editData, email: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={editData.phone}
                onChangeText={(text) =>
                  setEditData({ ...editData, phone: text })
                }
              />

              <TextInput
                style={styles.input}
                placeholder="Especialidade"
                placeholderTextColor="#999"
                value={editData.specialty}
                onChangeText={(text) =>
                  setEditData({ ...editData, specialty: text })
                }
              />

              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Bio"
                placeholderTextColor="#999"
                multiline
                value={editData.bio}
                onChangeText={(text) =>
                  setEditData({ ...editData, bio: text })
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
                  onPress={handleUpdateProfessional}
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
  professionalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  professionalSpecialty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFB800',
    fontWeight: '600',
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
  contactItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactContent: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bioText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  scheduleItem: {
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
  scheduleDay: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  scheduleDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066cc',
  },
  scheduleTime: {
    flex: 1,
  },
  scheduleTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scheduleStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
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
  bioInput: {
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

export default ProfessionalDetailsScreen;
