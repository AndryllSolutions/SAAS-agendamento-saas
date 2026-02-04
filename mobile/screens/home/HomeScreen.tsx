/**
 * Home Screen - Dashboard principal
 * Adaptado por role do usuário
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { AppointmentService, NotificationService } from '../services/api';
import { Appointment, UserRole } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout, canManageAppointments, isAdmin, isProfessional } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Buscar dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar agendamentos do dia
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const [appointmentsResponse, notificationsResponse] = await Promise.all([
        AppointmentService.getAppointments({
          page: 1,
          limit: 5,
          start_date: today,
          end_date: tomorrow,
        }),
        NotificationService.getUnreadCount(),
      ]);

      setAppointments(appointmentsResponse.items);
      setNotificationsCount(notificationsResponse.count);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => logout()
        },
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Card de estatística
  const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 mx-1">
      <Text className="text-gray-500 text-xs mb-1">{title}</Text>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
    </View>
  );

  // Card de agendamento
  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const startTime = new Date(appointment.start_time);
    const timeStr = startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3"
        onPress={() => navigation.navigate('AppointmentDetail', { id: appointment.id })}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">
              {appointment.client?.name || 'Cliente não identificado'}
            </Text>
            <Text className="text-gray-500 text-sm">
              {appointment.service?.name || 'Serviço não especificado'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-indigo-600 font-semibold">{timeStr}</Text>
            <View className={`px-2 py-1 rounded-full ${
              appointment.status === 'confirmed' ? 'bg-green-100' :
              appointment.status === 'scheduled' ? 'bg-blue-100' :
              appointment.status === 'cancelled' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              <Text className={`text-xs ${
                appointment.status === 'confirmed' ? 'text-green-700' :
                appointment.status === 'scheduled' ? 'text-blue-700' :
                appointment.status === 'cancelled' ? 'text-red-700' :
                'text-gray-700'
              }`}>
                {appointment.status === 'confirmed' ? 'Confirmado' :
                 appointment.status === 'scheduled' ? 'Agendado' :
                 appointment.status === 'cancelled' ? 'Cancelado' :
                 appointment.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-indigo-100 text-sm">
              {getGreeting()}
            </Text>
            <Text className="text-white text-xl font-bold">
              {user?.name || 'Usuário'}
            </Text>
            <Text className="text-indigo-200 text-xs mt-1">
              {isAdmin ? 'Administrador' : 
               isProfessional ? 'Profissional' : 
               'Funcionário'}
            </Text>
          </View>
          
          {/* Notificações */}
          <TouchableOpacity
            className="relative p-2"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text className="text-2xl">🔔</Text>
            {notificationsCount > 0 && (
              <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      <View className="px-4 py-4">
        {/* Estatísticas */}
        <View className="flex-row mb-6">
          <StatCard 
            title="Hoje" 
            value={appointments.length} 
            color="text-indigo-600" 
          />
          <StatCard 
            title="Confirmados" 
            value={appointments.filter(a => a.status === 'confirmed').length} 
            color="text-green-600" 
          />
          <StatCard 
            title="Pendentes" 
            value={appointments.filter(a => a.status === 'scheduled').length} 
            color="text-amber-600" 
          />
        </View>

        {/* Ações Rápidas */}
        {canManageAppointments && (
          <View className="mb-6">
            <Text className="text-gray-800 font-semibold mb-3">Ações Rápidas</Text>
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-indigo-500 p-4 rounded-xl mr-2 items-center"
                onPress={() => navigation.navigate('CreateAppointment')}
              >
                <Text className="text-2xl mb-1">📅</Text>
                <Text className="text-white font-medium text-sm">Novo Agend.</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-green-500 p-4 rounded-xl mx-1 items-center"
                onPress={() => navigation.navigate('Clients')}
              >
                <Text className="text-2xl mb-1">👥</Text>
                <Text className="text-white font-medium text-sm">Clientes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-blue-500 p-4 rounded-xl ml-2 items-center"
                onPress={() => navigation.navigate('Calendar')}
              >
                <Text className="text-2xl mb-1">📆</Text>
                <Text className="text-white font-medium text-sm">Calendário</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Próximos Agendamentos */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-800 font-semibold">Próximos Agendamentos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments') as any}>
              <Text className="text-indigo-500 text-sm">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View className="bg-white p-8 rounded-xl items-center">
              <Text className="text-gray-500">Carregando...</Text>
            </View>
          ) : appointments.length > 0 ? (
            appointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <View className="bg-white p-8 rounded-xl items-center border border-gray-100">
              <Text className="text-4xl mb-2">📭</Text>
              <Text className="text-gray-500 text-center">
                Nenhum agendamento para hoje
              </Text>
              {canManageAppointments && (
                <TouchableOpacity
                  className="mt-4 bg-indigo-500 px-4 py-2 rounded-lg"
                  onPress={() => navigation.navigate('CreateAppointment')}
                >
                  <Text className="text-white font-medium">Criar agendamento</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Botão Logout */}
        <TouchableOpacity
          className="bg-red-50 border border-red-200 p-4 rounded-xl items-center"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-medium">Sair do aplicativo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
