/**
 * Appointment Detail Screen - Detalhes do Agendamento
 * Baseado nos models Appointment, Service, Client, User
 * Endpoints: GET /appointments/{id}, POST /appointments/{id}/confirm, POST /appointments/{id}/cancel
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppointmentService } from '../../services/api';
import { Appointment, AppointmentStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';

const AppointmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { canManageAppointments, user } = useAuthStore();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await AppointmentService.getAppointment(id);
      setAppointment(response);
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Erro', 'Não foi possível carregar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await AppointmentService.confirmAppointment(id);
      Alert.alert('Sucesso', 'Agendamento confirmado');
      loadAppointment();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível confirmar o agendamento');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Agendamento',
      'Deseja realmente cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AppointmentService.cancelAppointment(id);
              Alert.alert('Sucesso', 'Agendamento cancelado');
              loadAppointment();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    try {
      await AppointmentService.updateAppointment(id, { status: AppointmentStatus.COMPLETED });
      Alert.alert('Sucesso', 'Agendamento marcado como concluído');
      loadAppointment();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível completar o agendamento');
    }
  };

  const handleCallClient = () => {
    if (appointment?.client?.phone) {
      Linking.openURL(`tel:${appointment.client.phone}`);
    }
  };

  const handleWhatsAppClient = () => {
    if (appointment?.client?.phone || appointment?.client?.cellphone) {
      const phone = (appointment.client.cellphone || appointment.client.phone)!.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${phone}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmado',
      pending: 'Pendente',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não compareceu',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !appointment) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Agendamento</Text>
          {canManageAppointments && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditAppointment', { id })}
            >
              <Text className="text-white font-medium">Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Banner */}
      <View className={`mx-4 -mt-4 p-4 rounded-2xl border ${getStatusColor(appointment.status)}`}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className={`text-sm font-medium opacity-70`}>Status</Text>
            <Text className={`text-lg font-bold`}>{getStatusLabel(appointment.status)}</Text>
          </View>
          <Text className="text-3xl">
            {appointment.status === 'confirmed' ? '✅' :
             appointment.status === 'pending' ? '⏳' :
             appointment.status === 'completed' ? '✔️' :
             appointment.status === 'cancelled' ? '❌' : '📅'}
          </Text>
        </View>
      </View>

      {/* Date & Time Card */}
      <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
        <View className="items-center">
          <Text className="text-gray-500 text-sm mb-1">Data e Horário</Text>
          <Text className="text-xl font-bold text-gray-900 capitalize">{formatDate(appointment.start_time)}</Text>
          <View className="flex-row items-center mt-2">
            <Text className="text-2xl font-bold text-indigo-600">{formatTime(appointment.start_time)}</Text>
            <Text className="text-gray-400 mx-2">-</Text>
            <Text className="text-2xl font-bold text-indigo-600">{formatTime(appointment.end_time)}</Text>
          </View>
          <Text className="text-gray-500 text-sm mt-2">
            Duração: {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} minutos
          </Text>
        </View>
      </View>

      {/* Service Info */}
      <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
        <Text className="text-gray-800 font-bold text-lg mb-4">Serviço</Text>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
            <Text className="text-2xl">💇</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-lg">
              {appointment.service?.name || 'Serviço não especificado'}
            </Text>
            {appointment.service?.price && (
              <Text className="text-indigo-600 font-bold">
                R$ {parseFloat(appointment.service.price.toString()).toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Client Info */}
      <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
        <Text className="text-gray-800 font-bold text-lg mb-4">Cliente</Text>
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => appointment.client?.id && navigation.navigate('ClientDetail', { id: appointment.client.id })}
        >
          <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
            <Text className="text-green-600 font-bold text-lg">
              {appointment.client?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-lg">
              {appointment.client?.name || 'Cliente não identificado'}
            </Text>
            {appointment.client?.phone && (
              <Text className="text-gray-500">{appointment.client.phone}</Text>
            )}
          </View>
          <Text className="text-gray-400 text-xl">›</Text>
        </TouchableOpacity>

        {/* Contact Actions */}
        {(appointment.client?.phone || appointment.client?.cellphone) && (
          <View className="flex-row mt-4 space-x-3">
            {appointment.client?.phone && (
              <TouchableOpacity
                className="flex-1 bg-green-100 p-3 rounded-xl items-center"
                onPress={handleCallClient}
              >
                <Text className="text-green-700 font-medium">📞 Ligar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-1 bg-green-500 p-3 rounded-xl items-center"
              onPress={handleWhatsAppClient}
            >
              <Text className="text-white font-medium">💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Professional Info */}
      {appointment.professional && (
        <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">Profissional</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
              <Text className="text-blue-600 font-bold text-lg">
                {appointment.professional.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-gray-900 text-lg">
                {appointment.professional.name}
              </Text>
              <Text className="text-gray-500">Profissional</Text>
            </View>
          </View>
        </View>
      )}

      {/* Notes */}
      {(appointment.client_notes || appointment.professional_notes || appointment.internal_notes) && (
        <View className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">Observações</Text>
          
          {appointment.client_notes && (
            <View className="mb-3">
              <Text className="text-gray-500 text-sm mb-1">Do cliente:</Text>
              <Text className="text-gray-900">{appointment.client_notes}</Text>
            </View>
          )}
          
          {appointment.professional_notes && (
            <View className="mb-3">
              <Text className="text-gray-500 text-sm mb-1">Do profissional:</Text>
              <Text className="text-gray-900">{appointment.professional_notes}</Text>
            </View>
          )}
          
          {appointment.internal_notes && (
            <View>
              <Text className="text-gray-500 text-sm mb-1">Internas:</Text>
              <Text className="text-gray-900">{appointment.internal_notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Cancellation Info */}
      {appointment.status === 'cancelled' && appointment.cancellation_reason && (
        <View className="mx-4 mt-4 bg-red-50 rounded-2xl shadow-sm p-6 border border-red-200">
          <Text className="text-red-800 font-bold text-lg mb-2">Motivo do Cancelamento</Text>
          <Text className="text-red-600">{appointment.cancellation_reason}</Text>
          {appointment.cancelled_at && (
            <Text className="text-red-400 text-sm mt-2">
              Cancelado em: {formatDate(appointment.cancelled_at)}
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      {canManageAppointments && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
        <View className="mx-4 mt-4 mb-6 space-y-3">
          {appointment.status === 'pending' && (
            <TouchableOpacity
              className="bg-green-500 p-4 rounded-2xl items-center"
              onPress={handleConfirm}
            >
              <Text className="text-white font-bold text-lg">✓ Confirmar Agendamento</Text>
            </TouchableOpacity>
          )}
          
          {appointment.status === 'confirmed' && (
            <TouchableOpacity
              className="bg-indigo-500 p-4 rounded-2xl items-center"
              onPress={handleComplete}
            >
              <Text className="text-white font-bold text-lg">✓ Marcar como Concluído</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className="bg-red-50 border border-red-200 p-4 rounded-2xl items-center"
            onPress={handleCancel}
          >
            <Text className="text-red-600 font-semibold">Cancelar Agendamento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Completed Actions */}
      {appointment.status === 'completed' && (
        <View className="mx-4 mt-4 mb-6">
          <TouchableOpacity
            className="bg-indigo-500 p-4 rounded-2xl items-center"
            onPress={() => navigation.navigate('CreateCommand', { appointment_id: id })}
          >
            <Text className="text-white font-bold text-lg">💰 Criar Comanda</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default AppointmentDetailScreen;
