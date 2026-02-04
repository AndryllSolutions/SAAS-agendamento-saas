/**
 * Create Service Screen - Criar/Editar Serviço
 * Baseado nos schemas ServiceCreate, ServiceUpdate
 * Endpoints: POST /services, PUT /services/{id}
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
import { ServiceService } from '../../services/api';
import { Service } from '../../types';

const CreateServiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id?: number };
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '60',
    category_id: null as number | null,
    color: '#6366f1',
    is_active: true,
    available_online: true,
    online_booking_enabled: true,
    requires_professional: true,
    commission_rate: '0',
    lead_time_minutes: '0',
    extra_cost: '',
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadService();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await ServiceService.getCategories();
      setCategories(response.items || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadService = async () => {
    try {
      const service = await ServiceService.getService(id!);
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price?.toString() || '',
        duration_minutes: service.duration_minutes?.toString() || '60',
        category_id: service.category_id || null,
        color: service.color || '#6366f1',
        is_active: service.is_active ?? true,
        available_online: service.available_online ?? true,
        online_booking_enabled: service.online_booking_enabled ?? true,
        requires_professional: service.requires_professional ?? true,
        commission_rate: service.commission_rate?.toString() || '0',
        lead_time_minutes: service.lead_time_minutes?.toString() || '0',
        extra_cost: service.extra_cost?.toString() || '',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do serviço');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do serviço é obrigatório');
      return false;
    }
    if (formData.name.length < 3) {
      Alert.alert('Erro', 'Nome deve ter no mínimo 3 caracteres');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return false;
    }
    const duration = parseInt(formData.duration_minutes);
    if (isNaN(duration) || duration < 5 || duration > 480) {
      Alert.alert('Erro', 'Duração deve ser entre 5 e 480 minutos');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        category_id: formData.category_id || undefined,
        color: formData.color,
        is_active: formData.is_active,
        available_online: formData.available_online,
        online_booking_enabled: formData.online_booking_enabled,
        requires_professional: formData.requires_professional,
        commission_rate: parseInt(formData.commission_rate) || 0,
        lead_time_minutes: parseInt(formData.lead_time_minutes) || 0,
        extra_cost: formData.extra_cost ? parseFloat(formData.extra_cost) : undefined,
      };

      if (isEditing) {
        await ServiceService.updateService(id!, payload);
        Alert.alert('Sucesso', 'Serviço atualizado com sucesso');
      } else {
        await ServiceService.createService(payload);
        Alert.alert('Sucesso', 'Serviço criado com sucesso');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o serviço');
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280'
  ];

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    required = false,
    suffix,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad';
    multiline?: boolean;
    required?: boolean;
    suffix?: string;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View className="flex-row items-center border border-gray-200 rounded-xl bg-white">
        <TextInput
          className="flex-1 p-3 text-gray-900"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
        {suffix && (
          <Text className="text-gray-500 pr-3">{suffix}</Text>
        )}
      </View>
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
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Informações Básicas */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Informações Básicas</Text>

          <InputField
            label="Nome do Serviço"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Ex: Corte de Cabelo"
            required
          />

          <InputField
            label="Descrição"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Descrição do serviço"
            multiline
          />

          <InputField
            label="Preço"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            placeholder="0.00"
            keyboardType="numeric"
            required
            suffix="R$"
          />

          <InputField
            label="Duração (minutos)"
            value={formData.duration_minutes}
            onChangeText={(text) => setFormData({ ...formData, duration_minutes: text })}
            placeholder="60"
            keyboardType="numeric"
            required
            suffix="min"
          />

          {/* Categoria */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Categoria</Text>
            <TouchableOpacity
              className="border border-gray-200 rounded-xl p-3 bg-white"
              onPress={() => {
                Alert.alert(
                  'Selecionar Categoria',
                  '',
                  categories.map((cat) => ({
                    text: cat.name,
                    onPress: () => setFormData({ ...formData, category_id: cat.id }),
                  })).concat([{ text: 'Cancelar', style: 'cancel' }])
                );
              }}
            >
              <Text className="text-gray-900">
                {categories.find((c) => c.id === formData.category_id)?.name || 'Selecione uma categoria'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cor */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Cor do Serviço</Text>
            <View className="flex-row flex-wrap">
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-10 h-10 rounded-full m-1 ${
                    formData.color === color ? 'border-2 border-gray-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => setFormData({ ...formData, color })}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Configurações</Text>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700">Serviço Ativo</Text>
            <Switch
              value={formData.is_active}
              onValueChange={(value) => setFormData({ ...formData, is_active: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.is_active ? '#6366f1' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700">Disponível Online</Text>
            <Switch
              value={formData.available_online}
              onValueChange={(value) => setFormData({ ...formData, available_online: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.available_online ? '#6366f1' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700">Permitir Agendamento Online</Text>
            <Switch
              value={formData.online_booking_enabled}
              onValueChange={(value) => setFormData({ ...formData, online_booking_enabled: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.online_booking_enabled ? '#6366f1' : '#f4f3f4'}
            />
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700">Requer Profissional</Text>
            <Switch
              value={formData.requires_professional}
              onValueChange={(value) => setFormData({ ...formData, requires_professional: value })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={formData.requires_professional ? '#6366f1' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Avançado */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-4">Avançado</Text>

          <InputField
            label="Taxa de Comissão"
            value={formData.commission_rate}
            onChangeText={(text) => setFormData({ ...formData, commission_rate: text })}
            placeholder="0"
            keyboardType="numeric"
            suffix="%"
          />

          <InputField
            label="Tempo de Preparação"
            value={formData.lead_time_minutes}
            onChangeText={(text) => setFormData({ ...formData, lead_time_minutes: text })}
            placeholder="0"
            keyboardType="numeric"
            suffix="min"
          />

          <InputField
            label="Custo Adicional"
            value={formData.extra_cost}
            onChangeText={(text) => setFormData({ ...formData, extra_cost: text })}
            placeholder="0.00"
            keyboardType="numeric"
            suffix="R$"
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
            {loading ? 'Salvando...' : isEditing ? 'Atualizar Serviço' : 'Criar Serviço'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateServiceScreen;
