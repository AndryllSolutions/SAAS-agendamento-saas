/**
 * Profile Screen - Perfil do usuário
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../../store/authStore';
import { UserService } from '../../services/api';

const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await UserService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      });
      
      updateUser({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      });
      
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-6 px-4">
        <Text className="text-white text-xl font-bold">Meu Perfil</Text>
      </View>

      {/* Avatar Section */}
      <View className="items-center -mt-8 mb-6">
        <View className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg items-center justify-center">
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <View className="w-full h-full rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-3xl font-bold text-indigo-600">
                {getInitials(user?.name || 'U')}
              </Text>
            </View>
          )}
        </View>
        
        {!isEditing && (
          <TouchableOpacity
            className="mt-2 bg-indigo-500 px-4 py-2 rounded-full"
            onPress={() => setIsEditing(true)}
          >
            <Text className="text-white font-medium text-sm">Editar Perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form */}
      <View className="px-4">
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Nome completo</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Seu nome"
              />
            ) : (
              <Text className="text-gray-900 font-medium text-lg">{user?.name}</Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Email</Text>
            <Text className="text-gray-900">{user?.email}</Text>
          </View>

          {/* Telefone */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Telefone</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />
            ) : (
              <Text className="text-gray-900">{user?.phone || 'Não informado'}</Text>
            )}
          </View>

          {/* Cargo */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm mb-1">Cargo</Text>
            <View className="flex-row items-center">
              <View className="bg-indigo-100 px-3 py-1 rounded-full">
                <Text className="text-indigo-700 font-medium text-sm capitalize">
                  {user?.role}
                </Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View>
            <Text className="text-gray-500 text-sm mb-1">Sobre</Text>
            {isEditing ? (
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 h-24"
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Conte um pouco sobre você..."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text className="text-gray-900">{user?.bio || 'Nenhuma informação adicional'}</Text>
            )}
          </View>
        </View>

        {/* Ações de Edição */}
        {isEditing && (
          <View className="flex-row mb-4">
            <TouchableOpacity
              className="flex-1 bg-gray-200 py-3 rounded-xl mr-2 items-center"
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  bio: user?.bio || '',
                  email: user?.email || '',
                });
              }}
              disabled={loading}
            >
              <Text className="text-gray-700 font-medium">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-indigo-500 py-3 rounded-xl ml-2 items-center"
              onPress={handleSave}
              disabled={loading}
            >
              <Text className="text-white font-medium">
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Configurações */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">🔔</Text>
              <Text className="text-gray-900 font-medium">Notificações</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">🔒</Text>
              <Text className="text-gray-900 font-medium">Segurança</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">⚙️</Text>
              <Text className="text-gray-900 font-medium">Configurações</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Sobre */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
          <Text className="text-gray-500 text-sm mb-2">Sobre o aplicativo</Text>
          <Text className="text-gray-900 font-medium">Atendo Mobile</Text>
          <Text className="text-gray-500 text-sm">Versão 1.0.0</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-50 border border-red-200 p-4 rounded-xl items-center mb-6"
          onPress={handleLogout}
        >
          <Text className="text-red-600 font-medium">Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
