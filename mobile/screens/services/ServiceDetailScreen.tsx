/**
 * Service Detail Screen - Detalhes do Serviço
 * Baseado nos models Service, ServiceCategory
 * Endpoints: GET /services/{id}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ServiceService } from '../../services/api';
import { Service } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ServiceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { canManageServices } = useAuthStore();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    try {
      setLoading(true);
      const response = await ServiceService.getService(id);
      setService(response);
    } catch (error) {
      console.error('Error loading service:', error);
      Alert.alert('Erro', 'Não foi possível carregar o serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateService', { id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este serviço? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ServiceService.deleteService(id);
              Alert.alert('Sucesso', 'Serviço excluído com sucesso');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o serviço');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number | string) => {
    return `R$ ${parseFloat(price.toString()).toFixed(2)}`;
  };

  if (loading || !service) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View 
        className="pt-12 pb-6 px-4"
        style={{ backgroundColor: service.color || '#6366f1' }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Detalhes do Serviço</Text>
          {canManageServices && (
            <TouchableOpacity onPress={handleEdit}>
              <Text className="text-white font-medium">Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Service Info Card */}
      <View className="px-4 -mt-4">
        <View className="bg-white rounded-2xl shadow-sm p-6">
          <View className="items-center mb-4">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: service.color || '#6366f1' }}
            >
              <Text className="text-white text-3xl">💇</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{service.name}</Text>
            {service.category && (
              <Text className="text-gray-500">{service.category.name}</Text>
            )}
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-gray-500 text-sm">Preço</Text>
            <Text className="text-3xl font-bold text-indigo-600">
              {formatPrice(service.price)}
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="px-4 py-4 space-y-4">
        {/* Duration */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Duração</Text>
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">⏱️</Text>
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {service.duration_minutes} minutos
              </Text>
              {service.lead_time_minutes > 0 && (
                <Text className="text-gray-500">
                  + {service.lead_time_minutes} min de preparação
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Status */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Status</Text>
          <View className="flex-row space-x-3">
            <View className={`flex-1 p-3 rounded-xl ${service.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
              <Text className={`font-medium ${service.is_active ? 'text-green-700' : 'text-gray-600'}`}>
                {service.is_active ? '✓ Ativo' : '✗ Inativo'}
              </Text>
            </View>
            <View className={`flex-1 p-3 rounded-xl ${service.available_online ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <Text className={`font-medium ${service.available_online ? 'text-blue-700' : 'text-gray-600'}`}>
                {service.available_online ? '🌐 Online' : '✗ Offline'}
              </Text>
            </View>
          </View>
        </View>

        {/* Commission */}
        {service.commission_rate > 0 && (
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-gray-800 font-bold text-lg mb-2">Comissão</Text>
            <Text className="text-gray-900">{service.commission_rate}% do valor</Text>
          </View>
        )}

        {/* Description */}
        {service.description && (
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-gray-800 font-bold text-lg mb-2">Descrição</Text>
            <Text className="text-gray-600">{service.description}</Text>
          </View>
        )}

        {/* Extra Cost */}
        {service.extra_cost && parseFloat(service.extra_cost.toString()) > 0 && (
          <View className="bg-amber-50 rounded-2xl shadow-sm p-4 border border-amber-200">
            <Text className="text-amber-800 font-bold text-lg mb-1">Custo Adicional</Text>
            <Text className="text-amber-600 text-xl font-bold">
              + {formatPrice(service.extra_cost)}
            </Text>
          </View>
        )}

        {/* Professionals */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Profissionais</Text>
          {service.assigned_professionals && service.assigned_professionals.length > 0 ? (
            service.assigned_professionals.map((prof: any) => (
              <View key={prof.id} className="flex-row items-center py-2 border-b border-gray-100 last:border-0">
                <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                  <Text className="text-indigo-600 font-bold">
                    {prof.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-gray-900">{prof.name}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500">Nenhum profissional atribuído</Text>
          )}
        </View>

        {/* Action Buttons */}
        {canManageServices && (
          <>
            <TouchableOpacity
              className="bg-indigo-500 p-4 rounded-2xl items-center"
              onPress={handleEdit}
            >
              <Text className="text-white font-bold text-lg">✏️ Editar Serviço</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-50 border border-red-200 p-4 rounded-2xl items-center"
              onPress={handleDelete}
            >
              <Text className="text-red-600 font-semibold">🗑️ Excluir Serviço</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ServiceDetailScreen;
