/**
 * Services Screen - Lista de Serviços
 * Baseado nos models Service, ServiceCategory
 * Endpoint: GET /services
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ServiceService } from '../../services/api';
import { Service } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ServicesScreen = () => {
  const navigation = useNavigation();
  const { canManageServices } = useAuthStore();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      
      const response = await ServiceService.getServices({
        page: currentPage,
        limit: 20,
      });

      if (reset) {
        setServices(response.items);
      } else {
        setServices(prev => [...prev, ...response.items]);
      }

      setHasMore(response.items.length === 20);
      setPage(currentPage + 1);
      
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadServices(true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadServices(false);
    }
  };

  const formatPrice = (price: number | string) => {
    return `R$ ${parseFloat(price.toString()).toFixed(2)}`;
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3"
      onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}
    >
      <View className="flex-row items-center">
        {/* Icon/Color */}
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: item.color || '#3B82F6' }}
        >
          <Text className="text-white text-xl">💇</Text>
        </View>
        
        {/* Info */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base">
            {item.name}
          </Text>
          <Text className="text-gray-500 text-sm">
            {item.duration_minutes} minutos
          </Text>
          {item.category && (
            <Text className="text-gray-400 text-xs">{item.category.name}</Text>
          )}
        </View>
        
        {/* Price & Status */}
        <View className="items-end">
          <Text className="text-indigo-600 font-bold text-lg">
            {formatPrice(item.price)}
          </Text>
          {item.is_active ? (
            <View className="bg-green-100 px-2 py-1 rounded-full mt-1">
              <Text className="text-green-700 text-xs">Ativo</Text>
            </View>
          ) : (
            <View className="bg-gray-100 px-2 py-1 rounded-full mt-1">
              <Text className="text-gray-600 text-xs">Inativo</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Online Booking Badge */}
      {item.available_online && (
        <View className="mt-2 flex-row items-center">
          <View className="bg-blue-50 px-2 py-1 rounded-full">
            <Text className="text-blue-600 text-xs">🌐 Disponível online</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Serviços</Text>
          {canManageServices && (
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-full"
              onPress={() => navigation.navigate('CreateService')}
            >
              <Text className="text-indigo-600 font-semibold">+ Novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row justify-around">
        <View className="items-center">
          <Text className="text-2xl font-bold text-indigo-600">{services.length}</Text>
          <Text className="text-gray-500 text-xs">Total</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-green-600">
            {services.filter(s => s.is_active).length}
          </Text>
          <Text className="text-gray-500 text-xs">Ativos</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {services.filter(s => s.available_online).length}
          </Text>
          <Text className="text-gray-500 text-xs">Online</Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">💇</Text>
            <Text className="text-gray-500 text-lg mb-2">
              Nenhum serviço cadastrado
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Toque em "+ Novo" para cadastrar
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Carregando...</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ServicesScreen;
