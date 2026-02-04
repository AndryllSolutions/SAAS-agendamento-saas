/**
 * Tela de Agendamentos
 * Lista completa de agendamentos com filtros
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppointmentService } from '../../services/api';
import { Appointment, AppointmentStatus } from '../../types';
import { useAuth } from '../../store/authStore';

const AppointmentsScreen = () => {
  const navigation = useNavigation();
  const { canManageAppointments } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await AppointmentService.getAppointments(params);

      if (reset) {
        setAppointments(response.items);
      } else {
        setAppointments(prev => [...prev, ...response.items]);
      }

      setHasMore(response.items.length === 20);
      setPage(currentPage + 1);
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadAppointments(false);
    }
  };

  const handleCancel = (appointment: Appointment) => {
    Alert.alert(
      'Cancelar Agendamento',
      `Deseja cancelar o agendamento de ${appointment.client?.name || 'cliente'}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AppointmentService.cancelAppointment(appointment.id);
              loadAppointments(true);
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          },
        },
      ]
    );
  };

  const handleConfirm = async (appointment: Appointment) => {
    try {
      await AppointmentService.confirmAppointment(appointment.id);
      loadAppointments(true);
      Alert.alert('Sucesso', 'Agendamento confirmado');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível confirmar o agendamento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'scheduled':
        return 'Agendado';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const startTime = new Date(item.start_time);
    const dateStr = startTime.toLocaleDateString('pt-BR');
    const timeStr = startTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <TouchableOpacity
        className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
        onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-lg">
              {item.client?.name || 'Cliente não identificado'}
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.service?.name || 'Serviço não especificado'}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
            <Text className={`text-xs font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-1">📅</Text>
            <Text className="text-gray-600 text-sm">{dateStr}</Text>
            <Text className="text-gray-400 mx-2">|</Text>
            <Text className="text-gray-400 mr-1">🕐</Text>
            <Text className="text-gray-600 text-sm">{timeStr}</Text>
          </View>
          
          {item.professional && (
            <Text className="text-gray-500 text-sm">
              {item.professional.name}
            </Text>
          )}
        </View>

        {/* Ações */}
        {canManageAppointments && item.status !== 'cancelled' && item.status !== 'completed' && (
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            {item.status === 'scheduled' && (
              <TouchableOpacity
                className="flex-1 bg-green-50 py-2 rounded-lg mr-2 items-center"
                onPress={() => handleConfirm(item)}
              >
                <Text className="text-green-600 font-medium text-sm">Confirmar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-1 bg-red-50 py-2 rounded-lg items-center"
              onPress={() => handleCancel(item)}
            >
              <Text className="text-red-600 font-medium text-sm">Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ 
    label, 
    value, 
    color 
  }: { 
    label: string; 
    value: AppointmentStatus | 'all'; 
    color: string;
  }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 ${
        filter === value ? color : 'bg-gray-100'
      }`}
      onPress={() => setFilter(value)}
    >
      <Text className={`text-sm font-medium ${
        filter === value ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Agendamentos</Text>
          {canManageAppointments && (
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-lg"
              onPress={() => navigation.navigate('CreateAppointment')}
            >
              <Text className="text-indigo-600 font-medium">+ Novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtros */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton label="Todos" value="all" color="bg-gray-600" />
          <FilterButton label="Confirmados" value="confirmed" color="bg-green-500" />
          <FilterButton label="Agendados" value="scheduled" color="bg-blue-500" />
          <FilterButton label="Em andamento" value="in_progress" color="bg-amber-500" />
          <FilterButton label="Concluídos" value="completed" color="bg-gray-500" />
          <FilterButton label="Cancelados" value="cancelled" color="bg-red-500" />
        </ScrollView>
      </View>

      {/* Lista */}
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">📭</Text>
            <Text className="text-gray-500 text-lg mb-2">
              Nenhum agendamento encontrado
            </Text>
            <Text className="text-gray-400 text-sm">
              Tente mudar os filtros ou criar um novo agendamento
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#6366f1" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default AppointmentsScreen;
