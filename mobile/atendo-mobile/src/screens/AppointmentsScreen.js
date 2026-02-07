import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
} from 'react-native';
import appointmentsService from '../services/appointmentsService';

const AppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const statuses = [
    { id: 'all', label: 'Todos' },
    { id: 'scheduled', label: 'Agendado' },
    { id: 'confirmed', label: 'Confirmado' },
    { id: 'in_progress', label: 'Em andamento' },
    { id: 'completed', label: 'Concluído' },
    { id: 'cancelled', label: 'Cancelado' },
  ];

  const dateFilters = [
    { id: 'all', label: 'Todos' },
    { id: 'today', label: 'Hoje' },
    { id: 'tomorrow', label: 'Amanhã' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mês' },
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchText, selectedStatus, selectedDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentsService.getAppointments();
      if (result.success) {
        setAppointments(result.data.appointments || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filtrar por texto de busca
    if (searchText) {
      filtered = filtered.filter(
        (apt) =>
          apt.client_crm?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          apt.service?.name?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((apt) => apt.status === selectedStatus);
    }

    // Filtrar por data
    if (selectedDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        aptDate.setHours(0, 0, 0, 0);

        switch (selectedDate) {
          case 'today':
            return aptDate.getTime() === today.getTime();
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return aptDate.getTime() === tomorrow.getTime();
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return aptDate >= today && aptDate <= weekEnd;
          case 'month':
            return (
              aptDate.getMonth() === today.getMonth() &&
              aptDate.getFullYear() === today.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    // Ordenar por data
    filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    setFilteredAppointments(filtered);
  };

  const formatTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      checked_in: '#2196F3',
      in_progress: '#FF9800',
      completed: '#4CAF50',
      cancelled: '#F44336',
      no_show: '#9E9E9E',
      scheduled: '#0066cc',
    };
    return colors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      checked_in: 'Check-in',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não Compareceu',
      scheduled: 'Agendado',
    };
    return labels[status] || status;
  };

  const renderAppointmentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.appointmentInfo}>
        <Text style={styles.appointmentDate}>{formatDate(item.start_time)}</Text>
        <Text style={styles.appointmentTime}>{formatTime(item.start_time)}</Text>
        <Text style={styles.appointmentService}>{item.service?.name || 'Serviço'}</Text>
        <Text style={styles.appointmentClient}>{item.client_crm?.name || 'Cliente'}</Text>
      </View>
      <Text style={styles.appointmentStatus}>{getStatusLabel(item.status)}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agendamentos</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente ou serviço..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.filterButton,
              selectedStatus === status.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status.id)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status.id && styles.filterButtonTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {dateFilters.map((date) => (
          <TouchableOpacity
            key={date.id}
            style={[
              styles.filterButton,
              selectedDate === date.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDate(date.id)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedDate === date.id && styles.filterButtonTextActive,
              ]}
            >
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
        </View>
      )}

      {/* New Appointment Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateAppointment')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    width: 4,
    height: 70,
    borderRadius: 2,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  appointmentService: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  appointmentClient: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AppointmentsScreen;
