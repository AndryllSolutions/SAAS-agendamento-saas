/**
 * Create Client Screen - Criar/Editar Cliente
 * Baseado nos schemas ClientCreate, ClientUpdate
 * Endpoints: POST /clients, PUT /clients/{id}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ClientService } from '../../services/api';
import { Client } from '../../types';

const CreateClientScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id?: number };
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    email: '',
    phone: '',
    cellphone: '',
    date_of_birth: '',
    cpf: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    marketing_whatsapp: false,
    marketing_email: false,
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const client = await ClientService.getClient(id!);
      setFormData({
        full_name: client.full_name || '',
        nickname: client.nickname || '',
        email: client.email || '',
        phone: client.phone || '',
        cellphone: client.cellphone || '',
        date_of_birth: client.date_of_birth || '',
        cpf: client.cpf || '',
        address: client.address || '',
        address_number: client.address_number || '',
        address_complement: client.address_complement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        zip_code: client.zip_code || '',
        marketing_whatsapp: client.marketing_whatsapp || false,
        marketing_email: client.marketing_email || false,
        notes: client.notes || '',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do cliente');
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return false;
    }
    if (formData.full_name.length < 3) {
      Alert.alert('Erro', 'Nome deve ter no mínimo 3 caracteres');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        ...formData,
        date_of_birth: formData.date_of_birth || undefined,
      };

      if (isEditing) {
        await ClientService.updateClient(id!, payload);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso');
      } else {
        await ClientService.createClient(payload);
        Alert.alert('Sucesso', 'Cliente criado com sucesso');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o cliente');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    required = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    multiline?: boolean;
    required?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 bg-white text-gray-900"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-white text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Informações Básicas */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Informações Básicas</Text>

          <InputField
            label="Nome Completo"
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
            placeholder="Digite o nome completo"
            required
          />

          <InputField
            label="Apelido"
            value={formData.nickname}
            onChangeText={(text) => setFormData({ ...formData, nickname: text })}
            placeholder="Como prefere ser chamado"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
          />

          <InputField
            label="Telefone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="(00) 0000-0000"
            keyboardType="phone-pad"
          />

          <InputField
            label="Celular"
            value={formData.cellphone}
            onChangeText={(text) => setFormData({ ...formData, cellphone: text })}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />

          <InputField
            label="Data de Nascimento"
            value={formData.date_of_birth}
            onChangeText={(text) => setFormData({ ...formData, date_of_birth: text })}
            placeholder="YYYY-MM-DD"
          />

          <InputField
            label="CPF"
            value={formData.cpf}
            onChangeText={(text) => setFormData({ ...formData, cpf: text })}
            placeholder="000.000.000-00"
          />
        </View>

        {/* Endereço */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Endereço</Text>

          <InputField
            label="Rua"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Nome da rua"
          />

          <View className="flex-row space-x-2">
            <View className="flex-1">
              <InputField
                label="Número"
                value={formData.address_number}
                onChangeText={(text) => setFormData({ ...formData, address_number: text })}
                placeholder="123"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Complemento"
                value={formData.address_complement}
                onChangeText={(text) => setFormData({ ...formData, address_complement: text })}
                placeholder="Apto 101"
              />
            </View>
          </View>

          <InputField
            label="Bairro"
            value={formData.neighborhood}
            onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
            placeholder="Nome do bairro"
          />

          <View className="flex-row space-x-2">
            <View className="flex-1">
              <InputField
                label="Cidade"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Cidade"
              />
            </View>
            <View className="w-20">
              <InputField
                label="Estado"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text.toUpperCase() })}
                placeholder="SP"
              />
            </View>
          </View>

          <InputField
            label="CEP"
            value={formData.zip_code}
            onChangeText={(text) => setFormData({ ...formData, zip_code: text })}
            placeholder="00000-000"
          />
        </View>

        {/* Preferências de Marketing */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Preferências</Text>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700">Aceita receber WhatsApp</Text>
            <Switch
              value={formData.marketing_whatsapp}
              onValueChange={(value) => setFormData({ ...formData, marketing_whatsapp: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.marketing_whatsapp ? '#6366f1' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Aceita receber Email</Text>
            <Switch
              value={formData.marketing_email}
              onValueChange={(value) => setFormData({ ...formData, marketing_email: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.marketing_email ? '#6366f1' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Observações */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Observações</Text>
          <InputField
            label="Notas sobre o cliente"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Informações adicionais..."
            multiline
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`p-4 rounded-2xl items-center mb-6 ${
            loading ? 'bg-gray-400' : 'bg-indigo-500'
          }`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">
            {loading
              ? 'Salvando...'
              : isEditing
              ? 'Atualizar Cliente'
              : 'Criar Cliente'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateClientScreen;
