/**
 * Create Appointment Screen - Criar/Editar Agendamento
 * Baseado nos schemas AppointmentCreate, AppointmentUpdate
 * Endpoints: POST /appointments, PUT /appointments/{id}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { AppointmentService, ClientService, UserService } from '../../services/api';
import { Client, Service, User, AppointmentStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';

const CreateAppointmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { client_id, appointment_id } = route.params as { client_id?: number; appointment_id?: number };
  const { user, company } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    client_id: client_id || null as number | null,
    professional_id: null as number | null,
    service_id: null as number | null,
    start_time: new Date(),
    client_notes: '',
    internal_notes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadData();
    if (appointment_id) {
      loadAppointment();
    }
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, professionalsRes, servicesRes] = await Promise.all([
        ClientService.getClients({ limit: 100 }),
        UserService.getUsers({ role: 'professional', limit: 100 }),
        AppointmentService.getServices({ limit: 100 }),
      ]);
      
      setClients(clientsRes.items || []);
      setProfessionals(professionalsRes.items || []);
      setServices(servicesRes.items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadAppointment = async () => {
    try {
      const appointment = await AppointmentService.getAppointment(appointment_id!);
      setFormData({
        client_id: appointment.client?.id || null,
        professional_id: appointment.professional?.id || null,
        service_id: appointment.service?.id || null,
        start_time: new Date(appointment.start_time),
        client_notes: appointment.client_notes || '',
        internal_notes: appointment.internal_notes || '',
      });
    } catch (error) {
      console.error('Error loading appointment:', error);
    }
  };

  const validateForm = () => {
    if (!formData.client_id) {
      Alert.alert('Erro', 'Selecione um cliente');
      return false;
    }
    if (!formData.service_id) {
      Alert.alert('Erro', 'Selecione um serviço');
      return false;
    }
    if (!formData.professional_id) {
      Alert.alert('Erro', 'Selecione um profissional');
      return false;
    }
    if (formData.start_time < new Date()) {
      Alert.alert('Erro', 'A data/hora deve ser no futuro');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const payload = {
        client_id: formData.client_id,
        professional_id: formData.professional_id,
        service_id: formData.service_id,
        start_time: formData.start_time.toISOString(),
        client_notes: formData.client_notes,
        internal_notes: formData.internal_notes,
      };

      if (appointment_id) {
        await AppointmentService.updateAppointment(appointment_id, payload);
        Alert.alert('Sucesso', 'Agendamento atualizado com sucesso');
      } else {
        await AppointmentService.createAppointment(payload);
        Alert.alert('Sucesso', 'Agendamento criado com sucesso');
      }
      
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.client_id);
  const selectedProfessional = professionals.find(p => p.id === formData.professional_id);
  const selectedService = services.find(s => s.id === formData.service_id);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">
            {appointment_id ? 'Editar Agendamento' : 'Novo Agendamento'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Cliente */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Cliente</Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-3 flex-row items-center"
            onPress={() => {
              // Abrir modal de seleção de cliente
              Alert.alert(
                'Selecionar Cliente',
                '',
                clients.map(c => ({
                  text: c.full_name,
                  onPress: () => setFormData({ ...formData, client_id: c.id }),
                })).concat([{ text: 'Cancelar', style: 'cancel' }])
              );
            }}
          >
            <Text className="flex-1 text-gray-900">
              {selectedClient?.full_name || 'Selecione um cliente'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Serviço */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Serviço</Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-3 flex-row items-center mb-3"
            onPress={() => {
              Alert.alert(
                'Selecionar Serviço',
                '',
                services.map(s => ({
                  text: `${s.name} - R$ ${s.price}`,
                  onPress: () => setFormData({ ...formData, service_id: s.id }),
                })).concat([{ text: 'Cancelar', style: 'cancel' }])
              );
            }}
          >
            <Text className="flex-1 text-gray-900">
              {selectedService?.name || 'Selecione um serviço'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
          
          {selectedService && (
            <View className="bg-indigo-50 p-3 rounded-xl">
              <Text className="text-indigo-700">
                Duração: {selectedService.duration_minutes} minutos
              </Text>
              <Text className="text-indigo-700 font-bold">
                Preço: R$ {parseFloat(selectedService.price.toString()).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Profissional */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Profissional</Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-3 flex-row items-center"
            onPress={() => {
              Alert.alert(
                'Selecionar Profissional',
                '',
                professionals.map(p => ({
                  text: p.full_name,
                  onPress: () => setFormData({ ...formData, professional_id: p.id }),
                })).concat([{ text: 'Cancelar', style: 'cancel' }])
              );
            }}
          >
            <Text className="flex-1 text-gray-900">
              {selectedProfessional?.full_name || 'Selecione um profissional'}
            </Text>
            <Text className="text-gray-400">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Data e Hora */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Data e Hora</Text>
          
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-3 mb-3"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-gray-500 text-sm mb-1">Data</Text>
            <Text className="text-gray-900 text-lg">
              {formData.start_time.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-3"
            onPress={() => setShowTimePicker(true)}
          >
            <Text className="text-gray-500 text-sm mb-1">Horário</Text>
            <Text className="text-gray-900 text-lg">
              {formData.start_time.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </TouchableOpacity>

          {/* DatePicker */}
          <DatePicker
            modal
            open={showDatePicker}
            date={formData.start_time}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              const newDate = new Date(formData.start_time);
              newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setFormData({ ...formData, start_time: newDate });
            }}
            onCancel={() => setShowDatePicker(false)}
          />

          {/* TimePicker */}
          <DatePicker
            modal
            open={showTimePicker}
            date={formData.start_time}
            mode="time"
            onConfirm={(date) => {
              setShowTimePicker(false);
              const newDate = new Date(formData.start_time);
              newDate.setHours(date.getHours(), date.getMinutes());
              setFormData({ ...formData, start_time: newDate });
            }}
            onCancel={() => setShowTimePicker(false)}
          />
        </View>

        {/* Observações */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Observações</Text>
          
          <View className="mb-3">
            <Text className="text-gray-500 text-sm mb-1">Observações do cliente</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-3 text-gray-900"
              multiline
              numberOfLines={3}
              value={formData.client_notes}
              onChangeText={(text) => setFormData({ ...formData, client_notes: text })}
              placeholder="Observações visíveis para o cliente"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-1">Observações internas</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-3 text-gray-900"
              multiline
              numberOfLines={3}
              value={formData.internal_notes}
              onChangeText={(text) => setFormData({ ...formData, internal_notes: text })}
              placeholder="Observações internas da equipe"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`p-4 rounded-2xl items-center mb-6 ${
            loading ? 'bg-gray-400' : 'bg-indigo-500'
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">
            {loading 
              ? 'Salvando...' 
              : appointment_id ? 'Atualizar Agendamento' : 'Criar Agendamento'
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateAppointmentScreen;
