import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { appointmentsService } from '../services/appointmentsService';

export default function CreateAppointmentScreen({ navigation, route }) {
  const appointmentId = route?.params?.appointmentId;
  const isEditing = !!appointmentId;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState({
    client_id: '',
    service_id: '',
    professional_id: '',
    start_time: new Date(),
    end_time: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hora depois
    notes: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  useEffect(() => {
    loadData();
    if (isEditing) {
      loadAppointmentDetails();
    }
  }, []);

  const loadData = async () => {
    try {
      // Aqui você carregaria clientes, serviços e profissionais da API
      // Por enquanto, usando dados mockados
      setClients([
        { id: 1, name: 'Cliente 1' },
        { id: 2, name: 'Cliente 2' },
      ]);
      setServices([
        { id: 1, name: 'Corte de cabelo', duration: 30 },
        { id: 2, name: 'Barba', duration: 20 },
        { id: 3, name: 'Corte + Barba', duration: 50 },
      ]);
      setProfessionals([
        { id: 1, name: 'Profissional 1' },
        { id: 2, name: 'Profissional 2' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadAppointmentDetails = async () => {
    try {
      const result = await appointmentsService.getAppointmentDetails(appointmentId);
      if (result.success) {
        setAppointment({
          ...result.data,
          start_time: new Date(result.data.start_time),
          end_time: new Date(result.data.end_time),
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setAppointment({ ...appointment, start_time: selectedDate });
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setAppointment({ ...appointment, end_time: selectedDate });
    }
  };

  const handleSubmit = async () => {
    if (!appointment.client_id || !appointment.service_id || !appointment.professional_id) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (isEditing) {
        result = await appointmentsService.updateAppointment(appointmentId, {
          client_id: appointment.client_id,
          service_id: appointment.service_id,
          professional_id: appointment.professional_id,
          start_time: appointment.start_time.toISOString(),
          end_time: appointment.end_time.toISOString(),
          notes: appointment.notes,
        });
      } else {
        result = await appointmentsService.createAppointment({
          client_id: appointment.client_id,
          service_id: appointment.service_id,
          professional_id: appointment.professional_id,
          start_time: appointment.start_time.toISOString(),
          end_time: appointment.end_time.toISOString(),
          notes: appointment.notes,
        });
      }

      if (result.success) {
        Alert.alert('Sucesso', isEditing ? 'Agendamento atualizado' : 'Agendamento criado', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</Text>

        {/* Client Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Cliente *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionList}>
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.optionButton,
                  appointment.client_id === client.id && styles.optionButtonActive,
                ]}
                onPress={() => setAppointment({ ...appointment, client_id: client.id })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    appointment.client_id === client.id && styles.optionButtonTextActive,
                  ]}
                >
                  {client.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Service Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Serviço *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionList}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.optionButton,
                  appointment.service_id === service.id && styles.optionButtonActive,
                ]}
                onPress={() => setAppointment({ ...appointment, service_id: service.id })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    appointment.service_id === service.id && styles.optionButtonTextActive,
                  ]}
                >
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Professional Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Profissional *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionList}>
            {professionals.map((prof) => (
              <TouchableOpacity
                key={prof.id}
                style={[
                  styles.optionButton,
                  appointment.professional_id === prof.id && styles.optionButtonActive,
                ]}
                onPress={() => setAppointment({ ...appointment, professional_id: prof.id })}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    appointment.professional_id === prof.id && styles.optionButtonTextActive,
                  ]}
                >
                  {prof.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Start Date/Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Data e Hora de Início *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateTime(appointment.start_time)}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={appointment.start_time}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}
        </View>

        {/* End Date/Time */}
        <View style={styles.section}>
          <Text style={styles.label}>Data e Hora de Término *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDateTime(appointment.end_time)}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={appointment.end_time}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Digite observações sobre o agendamento..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={appointment.notes}
            onChangeText={(text) => setAppointment({ ...appointment, notes: text })}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Atualizar' : 'Criar Agendamento'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionList: {
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  optionButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 10,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#0066cc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
