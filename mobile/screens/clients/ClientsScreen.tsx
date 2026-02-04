/**
 * Clients Screen - Lista de Clientes (CRM)
 * Baseado no model Client e schema ClientResponse
 * Endpoint: GET /clients
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClientService } from '../../services/api';
import { Client } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ClientsScreen = () => {
  const navigation = useNavigation();
  const { canManageClients } = useAuthStore();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = clients.filter(client => 
        client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const currentPage = reset ? 1 : page;
      
      const response = await ClientService.getClients({
        page: currentPage,
        limit: 20,
      });

      if (reset) {
        setClients(response.items);
        setFilteredClients(response.items);
      } else {
        setClients(prev => [...prev, ...response.items]);
      }

      setHasMore(response.items.length === 20);
      setPage(currentPage + 1);
      
    } catch (error) {
      console.error('Error loading clients:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClients(true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      loadClients(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3 flex-row items-center"
      onPress={() => navigation.navigate('ClientDetail', { id: item.id })}
    >
      {/* Avatar */}
      <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mr-4">
        <Text className="text-indigo-600 font-bold text-lg">
          {getInitials(item.full_name)}
        </Text>
      </View>
      
      {/* Info */}
      <View className="flex-1">
        <Text className="font-semibold text-gray-900 text-base">
          {item.full_name}
        </Text>
        {item.email && (
          <Text className="text-gray-500 text-sm">{item.email}</Text>
        )}
        {item.phone && (
          <Text className="text-gray-400 text-xs">{item.phone}</Text>
        )}
      </View>
      
      {/* Arrow */}
      <Text className="text-gray-400 text-xl">›</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Clientes</Text>
          {canManageClients && (
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-full"
              onPress={() => navigation.navigate('CreateClient')}
            >
              <Text className="text-indigo-600 font-semibold">+ Novo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-gray-900"
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">👥</Text>
            <Text className="text-gray-500 text-lg mb-2">
              {searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {searchQuery 
                ? 'Tente buscar com outros termos' 
                : 'Toque em "+ Novo" para cadastrar'}
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

export default ClientsScreen;
