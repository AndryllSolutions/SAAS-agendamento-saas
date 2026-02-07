import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { appointmentsService } from '../services/appointmentsService';

export default function AppointmentDetailsScreen({ navigation, route }) {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAppointmentDetails();
  }, []);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      const result = await appointmentsService.getAppointmentDetails(appointmentId);
      if (result.success) {
        setAppointment(result.data);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateAppointment', { appointmentId });
  };

  const handleCancel = () => {
    Alert.alert('Cancelar Agendamento', 'Tem certeza que deseja cancelar este agendamento?', [
      { text: 'Não', onPress: () => {}, style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          setActionLoading(true);
          const result = await appointmentsService.cancelAppointment(
            appointmentId,
            'Cancelado pelo usuário'
          );
          setActionLoading(false);

          if (result.success) {
            Alert.alert('Sucesso', 'Agendamento cancelado', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } else {
            Alert.alert('Erro', result.error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleReschedule = () => {
    navigation.navigate('CreateAppointment', { appointmentId });
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleString('pt-BR');
  };

  const formatTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#0066cc',
      confirmed: '#00aa00',
      in_progress: '#ff9900',
      completed: '#666',
      cancelled: '#ff0000',
    };
    return colors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Agendamento não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Status */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View
              style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]}
            />
            <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
          </View>
        </View>

        {/* Main Info Card */}
        <View style={styles.card}>
          <View style={styles.cardSection}>
            <Text style={styles.cardLabel}>Data e Hora</Text>
            <Text style={styles.cardValue}>{formatDateTime(appointment.start_time)}</Text>
            <Text style={styles.cardSubValue}>
              Duração: {formatTime(appointment.end_time)} (aprox.)
            </Text>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cliente</Text>
          </View>
          <View style={styles.cardSection}>
            <Text style={styles.cardValue}>{appointment.client_crm?.name || 'N/A'}</Text>
            <Text style={styles.cardSubValue}>{appointment.client_crm?.email || ''}</Text>
            <Text style={styles.cardSubValue}>{appointment.client_crm?.phone || ''}</Text>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Serviço</Text>
          </View>
          <View style={styles.cardSection}>
            <Text style={styles.cardValue}>{appointment.service?.name || 'N/A'}</Text>
            <Text style={styles.cardSubValue}>
              Duração: {appointment.service?.duration || 'N/A'} minutos
            </Text>
            {appointment.service?.description && (
              <Text style={styles.cardSubValue}>{appointment.service.description}</Text>
            )}
          </View>
        </View>

        {/* Professional Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profissional</Text>
          </View>
          <View style={styles.cardSection}>
            <Text style={styles.cardValue}>{appointment.professional?.name || 'N/A'}</Text>
            <Text style={styles.cardSubValue}>{appointment.professional?.email || ''}</Text>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Observações</Text>
            </View>
            <View style={styles.cardSection}>
              <Text style={styles.cardValue}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Payment Info */}
        {appointment.payment && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pagamento</Text>
            </View>
            <View style={styles.cardSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valor:</Text>
                <Text style={styles.infoValue}>
                  R$ {appointment.payment.amount?.toFixed(2) || 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{appointment.payment.status || 'N/A'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEdit}
                disabled={actionLoading}
              >
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.rescheduleButton]}
                onPress={handleReschedule}
                disabled={actionLoading}
              >
                <Text style={styles.rescheduleButtonText}>📅 Remarcar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton, actionLoading && styles.buttonDisabled]}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardSection: {
    padding: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 24,
    gap: 10,
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#0066cc',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rescheduleButton: {
    backgroundColor: '#ff9900',
  },
  rescheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});
