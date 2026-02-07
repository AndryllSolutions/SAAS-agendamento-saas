import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { appointmentsService } from '../services/appointmentsService';
import { authService } from '../services/authService';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obter usuário atual
      const currentUser = await authService.getUserInfo();
      setUser(currentUser);

      // Obter agendamentos de hoje
      const todayResult = await appointmentsService.getTodayAppointments();
      if (todayResult.success) {
        setTodayAppointments(todayResult.data.appointments || []);
      }

      // Obter próximos agendamentos
      const upcomingResult = await appointmentsService.getUpcomingAppointments(7);
      if (upcomingResult.success) {
        setUpcomingAppointments(upcomingResult.data.appointments || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await authService.logout();
          navigation.replace('Login');
        },
        style: 'destructive',
      },
    ]);
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
    switch (status) {
      case 'scheduled':
        return '#0066cc';
      case 'confirmed':
        return '#00aa00';
      case 'in_progress':
        return '#ff9900';
      case 'completed':
        return '#666';
      case 'cancelled':
        return '#ff0000';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      in_progress: 'Em andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      no_show: 'Não compareceu',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name || 'Usuário'}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayAppointments.length}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{upcomingAppointments.length}</Text>
          <Text style={styles.statLabel}>Próximos 7 dias</Text>
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Agendamentos de Hoje</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('Appointments')}
            >
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]} />
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentTime}>{formatTime(appointment.start_time)}</Text>
                <Text style={styles.appointmentService}>{appointment.service?.name || 'Serviço'}</Text>
                <Text style={styles.appointmentClient}>{appointment.client_crm?.name || 'Cliente'}</Text>
              </View>
              <Text style={styles.appointmentStatus}>{getStatusLabel(appointment.status)}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyMessage}>Nenhum agendamento para hoje</Text>
        )}
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
        </View>

        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.slice(0, 5).map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('Appointments')}
            >
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]} />
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentDate}>{formatDate(appointment.start_time)}</Text>
                <Text style={styles.appointmentTime}>{formatTime(appointment.start_time)}</Text>
                <Text style={styles.appointmentService}>{appointment.service?.name || 'Serviço'}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyMessage}>Nenhum agendamento próximo</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Appointments')}
        >
          <Text style={styles.primaryButtonText}>+ Ver Agendamentos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  logoutButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#0066cc',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statusIndicator: {
    width: 4,
    height: 60,
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
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  actionButtons: {
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  secondaryButtonText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: '600',
  },
});
