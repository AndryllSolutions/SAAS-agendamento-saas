import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import notificationsService from '../services/notificationsService';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notificationSettings, setNotificationSettings] = useState({
    appointments: true,
    payments: true,
    messages: true,
    promotions: true,
    system: true,
  });

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Não Lidas', value: 'unread' },
    { label: 'Agendamentos', value: 'appointments' },
    { label: 'Pagamentos', value: 'payments' },
  ];

  // Carregar notificações
  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, [selectedFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const filters = selectedFilter !== 'all' ? { type: selectedFilter } : {};
      const result = await notificationsService.getNotifications({
        limit: 100,
        ...filters,
      });
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar notificações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await notificationsService.getNotificationSettings();
      if (result.success) {
        setNotificationSettings(result.data || notificationSettings);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications().finally(() => setRefreshing(false));
  }, [selectedFilter]);

  // Marcar como lida
  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationsService.markAsRead(notificationId);
      if (result.success) {
        loadNotifications();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao marcar notificação como lida');
    }
  };

  // Deletar notificação
  const handleDeleteNotification = async (notificationId) => {
    Alert.alert('Deletar', 'Deseja deletar esta notificação?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            const result = await notificationsService.deleteNotification(notificationId);
            if (result.success) {
              loadNotifications();
            }
          } catch (error) {
            Alert.alert('Erro', 'Falha ao deletar notificação');
          }
        },
      },
    ]);
  };

  // Atualizar configuração
  const handleUpdateSetting = async (key, value) => {
    try {
      const result = await notificationsService.updateNotificationSettings({
        [key]: value,
      });

      if (result.success) {
        setNotificationSettings({
          ...notificationSettings,
          [key]: value,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar configuração');
    }
  };

  // Renderizar item de notificação
  const renderNotificationItem = ({ item }) => {
    const getIcon = (type) => {
      const icons = {
        appointments: 'calendar',
        payments: 'card',
        messages: 'mail',
        promotions: 'gift',
        system: 'settings',
      };
      return icons[type] || 'notifications';
    };

    const getColor = (type) => {
      const colors = {
        appointments: '#2196F3',
        payments: '#4CAF50',
        messages: '#FF9800',
        promotions: '#E91E63',
        system: '#9C27B0',
      };
      return colors[type] || '#666';
    };

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={[styles.notificationIcon, { backgroundColor: getColor(item.type) }]}>
          <Ionicons name={getIcon(item.type)} size={20} color="#fff" />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleString('pt-BR')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Ionicons name="trash" size={18} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selectedFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma notificação</Text>
          </View>
        }
      />

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Configurações de Notificações</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="calendar" size={20} color="#2196F3" />
            <Text style={styles.settingLabel}>Agendamentos</Text>
          </View>
          <Switch
            value={notificationSettings.appointments}
            onValueChange={(value) => handleUpdateSetting('appointments', value)}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationSettings.appointments ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="card" size={20} color="#4CAF50" />
            <Text style={styles.settingLabel}>Pagamentos</Text>
          </View>
          <Switch
            value={notificationSettings.payments}
            onValueChange={(value) => handleUpdateSetting('payments', value)}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationSettings.payments ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="mail" size={20} color="#FF9800" />
            <Text style={styles.settingLabel}>Mensagens</Text>
          </View>
          <Switch
            value={notificationSettings.messages}
            onValueChange={(value) => handleUpdateSetting('messages', value)}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationSettings.messages ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="gift" size={20} color="#E91E63" />
            <Text style={styles.settingLabel}>Promoções</Text>
          </View>
          <Switch
            value={notificationSettings.promotions}
            onValueChange={(value) => handleUpdateSetting('promotions', value)}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationSettings.promotions ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="settings" size={20} color="#9C27B0" />
            <Text style={styles.settingLabel}>Sistema</Text>
          </View>
          <Switch
            value={notificationSettings.system}
            onValueChange={(value) => handleUpdateSetting('system', value)}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationSettings.system ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default NotificationsScreen;
