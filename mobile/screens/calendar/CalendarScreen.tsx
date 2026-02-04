/**
 * Calendar Screen - Calendário Visual de Agendamentos
 * Baseado no model Appointment
 * Endpoint: GET /appointments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppointmentService } from '../../services/api';
import { Appointment } from '../../types';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Gerar dias do mês atual
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const response = await AppointmentService.getAppointments({
        start_date: startOfMonth.toISOString().split('T')[0],
        end_date: endOfMonth.toISOString().split('T')[0],
        limit: 100,
      });
      
      setAppointments(response.items || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate.getMonth()]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.start_time.startsWith(dateStr));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate();
  };

  const changeMonth = (delta: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1));
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const days = generateCalendarDays();
  const selectedDayAppointments = getAppointmentsForDay(selectedDate.getDate());

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <Text className="text-white text-xl font-bold">Calendário</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Navigation */}
        <View className="bg-white px-4 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Text className="text-2xl text-indigo-600">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 capitalize">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Text className="text-2xl text-indigo-600">→</Text>
          </TouchableOpacity>
        </View>

        {/* Week Days Header */}
        <View className="bg-white px-2 pb-2 flex-row">
          {weekDays.map((day, index) => (
            <View key={index} className="flex-1 items-center py-2">
              <Text className="text-gray-500 font-medium text-sm">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="bg-white px-2 pb-4">
          <View className="flex-row flex-wrap">
            {days.map((day, index) => {
              if (day === null) {
                return <View key={index} className="w-[14.28%] aspect-square" />;
              }

              const dayAppointments = getAppointmentsForDay(day);
              const hasAppointments = dayAppointments.length > 0;

              return (
                <TouchableOpacity
                  key={index}
                  className={`w-[14.28%] aspect-square items-center justify-center p-1 ${
                    isSelected(day) ? 'bg-indigo-500' : ''
                  } ${isToday(day) && !isSelected(day) ? 'bg-indigo-100' : ''}`}
                  onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))}
                >
                  <Text className={`text-lg font-medium ${
                    isSelected(day) ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day}
                  </Text>
                  {hasAppointments && (
                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected(day) ? 'bg-white' : 'bg-indigo-500'
                    }`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day Appointments */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Agendamentos do Dia {selectedDate.getDate()}
          </Text>

          {selectedDayAppointments.length > 0 ? (
            selectedDayAppointments.map(appointment => (
              <TouchableOpacity
                key={appointment.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3"
                onPress={() => navigation.navigate('AppointmentDetail', { id: appointment.id })}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {appointment.client?.name || 'Cliente não identificado'}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {appointment.service?.name || 'Serviço não especificado'}
                    </Text>
                    <Text className="text-indigo-600 font-bold mt-1">
                      {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    appointment.status === 'confirmed' ? 'bg-green-100' :
                    appointment.status === 'pending' ? 'bg-amber-100' :
                    'bg-gray-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'text-green-700' :
                      appointment.status === 'pending' ? 'text-amber-700' :
                      'text-gray-700'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmado' :
                       appointment.status === 'pending' ? 'Pendente' : appointment.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white p-8 rounded-2xl items-center">
              <Text className="text-4xl mb-2">📭</Text>
              <Text className="text-gray-500">Nenhum agendamento neste dia</Text>
              <TouchableOpacity
                className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl"
                onPress={() => navigation.navigate('CreateAppointment', { 
                  date: selectedDate.toISOString().split('T')[0] 
                })}
              >
                <Text className="text-white font-semibold">+ Criar Agendamento</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarScreen;
