/**
 * Settings Screen - Configurações do App
 * Baseado nas configs do backend (tema, notificações, etc.)
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout, user, settings, updateSettings } = useAuthStore();

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

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress || hasSwitch}
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-base">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={switchValue ? '#6366f1' : '#f4f3f4'}
        />
      ) : showArrow ? (
        <Text className="text-gray-400 text-xl">›</Text>
      ) : null}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-gray-500 font-medium text-sm uppercase px-4 py-2 mt-4">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <Text className="text-white text-xl font-bold">Configurações</Text>
      </View>

      <ScrollView>
        {/* User Info */}
        <View className="bg-white m-4 rounded-2xl shadow-sm p-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-indigo-600 font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-gray-900 font-bold text-lg">{user?.name}</Text>
              <Text className="text-gray-500">{user?.email}</Text>
              <Text className="text-indigo-500 text-sm capitalize">{user?.role}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text className="text-indigo-500 font-medium">Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aparência */}
        <SectionTitle title="Aparência" />
        <View className="bg-white">
          <SettingItem
            icon="🌙"
            title="Modo Escuro"
            subtitle="Usar tema escuro no aplicativo"
            hasSwitch
            switchValue={settings?.theme === 'dark'}
            onSwitchChange={(value) => updateSettings?.({ theme: value ? 'dark' : 'light' })}
          />
        </View>

        {/* Notificações */}
        <SectionTitle title="Notificações" />
        <View className="bg-white">
          <SettingItem
            icon="🔔"
            title="Notificações Push"
            subtitle="Receber alertas no celular"
            hasSwitch
            switchValue={settings?.pushNotifications !== false}
            onSwitchChange={(value) => updateSettings?.({ pushNotifications: value })}
          />
          <SettingItem
            icon="📧"
            title="Notificações por Email"
            subtitle="Receber emails de atualizações"
            hasSwitch
            switchValue={settings?.emailNotifications !== false}
            onSwitchChange={(value) => updateSettings?.({ emailNotifications: value })}
          />
          <SettingItem
            icon="💬"
            title="Notificações WhatsApp"
            subtitle="Receber mensagens no WhatsApp"
            hasSwitch
            switchValue={settings?.whatsappNotifications || false}
            onSwitchChange={(value) => updateSettings?.({ whatsappNotifications: value })}
          />
        </View>

        {/* Segurança */}
        <SectionTitle title="Segurança" />
        <View className="bg-white">
          <SettingItem
            icon="🔐"
            title="Biometria"
            subtitle="Usar Face ID / Impressão Digital"
            hasSwitch
            switchValue={settings?.biometricEnabled || false}
            onSwitchChange={(value) => updateSettings?.({ biometricEnabled: value })}
          />
          <SettingItem
            icon="🔑"
            title="Alterar Senha"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        {/* Sobre */}
        <SectionTitle title="Sobre" />
        <View className="bg-white">
          <SettingItem
            icon="📱"
            title="Versão do App"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="📋"
            title="Termos de Uso"
            onPress={() => {}}
          />
          <SettingItem
            icon="🔒"
            title="Política de Privacidade"
            onPress={() => {}}
          />
          <SettingItem
            icon="❓"
            title="Ajuda e Suporte"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View className="p-4">
          <TouchableOpacity
            className="bg-red-50 border border-red-200 p-4 rounded-2xl items-center"
            onPress={handleLogout}
          >
            <Text className="text-red-600 font-semibold text-lg">🚪 Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        {/* Espaço no final */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
