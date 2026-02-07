import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import settingsService from '../services/settingsService';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);

  // Carregar configurações
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await settingsService.getSettings();
      if (result.success) {
        setSettings(result.data);
        setNotificationsEnabled(result.data?.notifications_enabled ?? true);
        setDarkModeEnabled(result.data?.dark_mode ?? false);
        setOfflineModeEnabled(result.data?.offline_mode ?? false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar configuração
  const updateSetting = async (key, value) => {
    try {
      const result = await settingsService.updateSettings({
        [key]: value,
      });

      if (result.success) {
        setSettings({ ...settings, [key]: value });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar configuração');
    }
  };

  // Fazer logout
  const handleLogout = () => {
    Alert.alert('Logout', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Sair',
        onPress: () => {
          // Implementar logout
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      {/* Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="person" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Meu Perfil</Text>
              <Text style={styles.settingDescription}>Editar informações pessoais</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="lock-closed" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Alterar Senha</Text>
              <Text style={styles.settingDescription}>Atualizar sua senha</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Notificações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Notificações Push</Text>
              <Text style={styles.settingDescription}>Receber alertas do app</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              updateSetting('notifications_enabled', value);
            }}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="mail" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Notificações por Email</Text>
              <Text style={styles.settingDescription}>Receber resumos por email</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Aparência */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="moon" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Modo Escuro</Text>
              <Text style={styles.settingDescription}>Usar tema escuro</Text>
            </View>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={(value) => {
              setDarkModeEnabled(value);
              updateSetting('dark_mode', value);
            }}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={darkModeEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="language" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Idioma</Text>
              <Text style={styles.settingDescription}>Português (Brasil)</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Dados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="cloud-offline" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Modo Offline</Text>
              <Text style={styles.settingDescription}>Usar dados em cache</Text>
            </View>
          </View>
          <Switch
            value={offlineModeEnabled}
            onValueChange={(value) => {
              setOfflineModeEnabled(value);
              updateSetting('offline_mode', value);
            }}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={offlineModeEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert('Limpar Cache', 'Deseja limpar todos os dados em cache?', [
              { text: 'Cancelar', onPress: () => {} },
              {
                text: 'Limpar',
                onPress: () => {
                  Alert.alert('Sucesso', 'Cache limpo com sucesso');
                },
              },
            ]);
          }}
        >
          <View style={styles.settingContent}>
            <Ionicons name="trash" size={24} color="#F44336" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Limpar Cache</Text>
              <Text style={styles.settingDescription}>Liberar espaço do dispositivo</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="information" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Sobre o App</Text>
              <Text style={styles.settingDescription}>Versão 1.0.0</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="help-circle" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Ajuda e Suporte</Text>
              <Text style={styles.settingDescription}>Contate o suporte</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="document-text" size={24} color="#0066cc" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Termos de Serviço</Text>
              <Text style={styles.settingDescription}>Leia nossos termos</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Atendo v1.0.0</Text>
      </View>
    </ScrollView>
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
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
