/**
 * Notifications Screen - Central de Notificações
 * Baseado nos models Notification, UserPushSubscription
 * Endpoints: GET /notifications, PUT /notifications/{id}/read
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
import { NotificationService } from '../../services/api';
import { Notification } from '../../types';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications({
        unread_only: filter === 'unread',
        limit: 50,
      });
      setNotifications(response.items || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [filter]);

  const markAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('Sucesso', 'Todas as notificações marcadas como lidas');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar como lidas');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'payment':
        return '💰';
      case 'client':
        return '👤';
      case 'system':
        return '⚙️';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-100 ${!item.is_read ? 'bg-indigo-50' : 'bg-white'}`}
      onPress={() => {
        if (!item.is_read) markAsRead(item.id);
        if (item.action_url) {
          // Navegar para a URL da ação
          console.log('Navigate to:', item.action_url);
        }
      }}
    >
      <View className="flex-row">
        <View className="text-2xl mr-3">{getIconForType(item.type)}</View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`font-semibold ${!item.is_read ? 'text-indigo-900' : 'text-gray-900'}`}>
              {item.title}
            </Text>
            <Text className="text-gray-400 text-xs">{formatTimeAgo(item.created_at)}</Text>
          </View>
          <Text className="text-gray-600 mt-1">{item.message}</Text>
          {!item.is_read && (
            <View className="flex-row mt-2">
              <View className="w-2 h-2 rounded-full bg-indigo-500" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Notificações</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              className="bg-white px-3 py-1 rounded-full"
              onPress={markAllAsRead}
            >
              <Text className="text-indigo-600 text-sm font-medium">
                Marcar tudo como lido
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 ${filter === 'all' ? 'border-b-2 border-indigo-500' : ''}`}
          onPress={() => setFilter('all')}
        >
          <Text className={`text-center font-medium ${filter === 'all' ? 'text-indigo-600' : 'text-gray-500'}`}>
            Todas ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 ${filter === 'unread' ? 'border-b-2 border-indigo-500' : ''}`}
          onPress={() => setFilter('unread')}
        >
          <Text className={`text-center font-medium ${filter === 'unread' ? 'text-indigo-600' : 'text-gray-500'}`}>
            Não lidas ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">🔔</Text>
            <Text className="text-gray-500 text-lg">
              {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;
