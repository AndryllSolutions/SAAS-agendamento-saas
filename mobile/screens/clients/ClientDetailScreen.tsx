/**
 * Client Detail Screen - Detalhes do Cliente
 * Baseado nos models Client, Appointment, schemas ClientResponse
 * Endpoints: GET /clients/{id}, GET /appointments?client_id={id}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ClientService, AppointmentService } from '../../services/api';
import { Client, Appointment } from '../../types';
import { useAuthStore } from '../../store/authStore';

const ClientDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { canManageClients } = useAuthStore();
  
  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, appointmentsResponse] = await Promise.all([
        ClientService.getClient(id),
        AppointmentService.getAppointments({ client_id: id, limit: 5 }),
      ]);
      
      setClient(clientResponse);
      setAppointments(appointmentsResponse.items || []);
    } catch (error) {
      console.error('Error loading client:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/55${cleanPhone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleEdit = () => {
    navigation.navigate('EditClient', { id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este cliente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClientService.deleteClient(id);
              Alert.alert('Sucesso', 'Cliente excluído com sucesso');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o cliente');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  if (loading || !client) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-6 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Detalhes do Cliente</Text>
          {canManageClients && (
            <TouchableOpacity onPress={handleEdit}>
              <Text className="text-white font-medium">Editar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Profile Card */}
      <View className="px-4 -mt-4">
        <View className="bg-white rounded-2xl shadow-sm p-6">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mb-3">
              <Text className="text-indigo-600 font-bold text-2xl">
                {getInitials(client.full_name)}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">{client.full_name}</Text>
            {client.nickname && (
              <Text className="text-gray-500">"{client.nickname}"</Text>
            )}
          </View>

          {/* Contact Actions */}
          <View className="flex-row justify-center mt-4 space-x-4">
            {client.phone && (
              <TouchableOpacity
                className="bg-green-100 p-3 rounded-full"
                onPress={() => handleCall(client.phone!)}
              >
                <Text className="text-2xl">📞</Text>
              </TouchableOpacity>
            )}
            {client.cellphone && (
              <TouchableOpacity
                className="bg-green-500 p-3 rounded-full"
                onPress={() => handleWhatsApp(client.cellphone!)}
              >
                <Text className="text-2xl">💬</Text>
              </TouchableOpacity>
            )}
            {client.email && (
              <TouchableOpacity
                className="bg-blue-100 p-3 rounded-full"
                onPress={() => handleEmail(client.email!)}
              >
                <Text className="text-2xl">📧</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Info Sections */}
      <View className="px-4 py-4 space-y-4">
        {/* Informações Pessoais */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Informações Pessoais</Text>
          
          {client.email && (
            <InfoRow label="Email" value={client.email} />
          )}
          {client.phone && (
            <InfoRow label="Telefone" value={client.phone} />
          )}
          {client.cellphone && (
            <InfoRow label="Celular" value={client.cellphone} />
          )}
          {client.date_of_birth && (
            <InfoRow 
              label="Data de Nascimento" 
              value={new Date(client.date_of_birth).toLocaleDateString('pt-BR')} 
            />
          )}
          {client.cpf && (
            <InfoRow label="CPF" value={client.cpf} />
          )}
        </View>

        {/* Endereço */}
        {(client.address || client.city) && (
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">Endereço</Text>
            {client.address && (
              <InfoRow 
                label="Endereço" 
                value={`${client.address}${client.address_number ? `, ${client.address_number}` : ''}`} 
              />
            )}
            {client.neighborhood && (
              <InfoRow label="Bairro" value={client.neighborhood} />
            )}
            {(client.city || client.state) && (
              <InfoRow 
                label="Cidade/Estado" 
                value={`${client.city || ''}${client.state ? ` - ${client.state}` : ''}`} 
              />
            )}
            {client.zip_code && (
              <InfoRow label="CEP" value={client.zip_code} />
            )}
          </View>
        )}

        {/* Créditos */}
        {client.credits !== undefined && client.credits > 0 && (
          <View className="bg-green-50 rounded-2xl shadow-sm p-4 border border-green-200">
            <Text className="text-green-800 font-bold text-lg mb-2">Créditos Disponíveis</Text>
            <Text className="text-green-600 text-2xl font-bold">
              R$ {parseFloat(client.credits.toString()).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Observações */}
        {client.notes && (
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-gray-800 font-bold text-lg mb-2">Observações</Text>
            <Text className="text-gray-600">{client.notes}</Text>
          </View>
        )}

        {/* Histórico de Agendamentos */}
        <View className="bg-white rounded-2xl shadow-sm p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-800 font-bold text-lg">Últimos Agendamentos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments', { client_id: id })}>
              <Text className="text-indigo-500 text-sm">Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {appointments.length > 0 ? (
            appointments.map(apt => (
              <TouchableOpacity
                key={apt.id}
                className="border-b border-gray-100 py-3 last:border-0"
                onPress={() => navigation.navigate('AppointmentDetail', { id: apt.id })}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-medium text-gray-900">
                      {apt.service?.name || 'Serviço não especificado'}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {new Date(apt.start_time).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-green-100' :
                    apt.status === 'pending' ? 'bg-amber-100' :
                    apt.status === 'completed' ? 'bg-gray-100' :
                    'bg-red-100'
                  }`}>
                    <Text className={`text-xs ${
                      apt.status === 'confirmed' ? 'text-green-700' :
                      apt.status === 'pending' ? 'text-amber-700' :
                      apt.status === 'completed' ? 'text-gray-700' :
                      'text-red-700'
                    }`}>
                      {apt.status === 'confirmed' ? 'Confirmado' :
                       apt.status === 'pending' ? 'Pendente' :
                       apt.status === 'completed' ? 'Concluído' :
                       apt.status === 'cancelled' ? 'Cancelado' : apt.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">Nenhum agendamento encontrado</Text>
          )}
        </View>

        {/* Novo Agendamento Button */}
        <TouchableOpacity
          className="bg-indigo-500 p-4 rounded-2xl items-center"
          onPress={() => navigation.navigate('CreateAppointment', { client_id: id })}
        >
          <Text className="text-white font-bold">+ Novo Agendamento</Text>
        </TouchableOpacity>

        {/* Excluir Cliente */}
        {canManageClients && (
          <TouchableOpacity
            className="bg-red-50 border border-red-200 p-4 rounded-2xl items-center"
            onPress={handleDelete}
          >
            <Text className="text-red-600 font-semibold">Excluir Cliente</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// Componente auxiliar para linha de informação
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
    <Text className="text-gray-500">{label}</Text>
    <Text className="text-gray-900 font-medium">{value}</Text>
  </View>
);

export default ClientDetailScreen;
