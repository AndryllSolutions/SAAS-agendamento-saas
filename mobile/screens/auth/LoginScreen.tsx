/**
 * Tela de Login
 * Autenticação mobile otimizada
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../store/authStore';
import { LoginRequest } from '../../types';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();

  // Limpar erro ao digitar
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleLogin = async () => {
    // Validação básica
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Digite sua senha');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      // Login bem-sucedido - navegação automática pelo store
    } catch (error) {
      // Erro já tratado pelo store
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        {/* Logo/Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-indigo-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">A</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Atendo
          </Text>
          <Text className="text-gray-600 text-center">
            Sistema completo de agendamento online
          </Text>
        </View>

        {/* Formulário */}
        <View className="mb-6">
          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Email
            </Text>
            <TextInput
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Senha */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Senha
            </Text>
            <View className="relative">
              <TextInput
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-3.5"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text className="text-gray-500">
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Erro */}
          {error && (
            <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Botão Login */}
          <TouchableOpacity
            className={`w-full py-3 rounded-lg items-center justify-center ${
              isLoading
                ? 'bg-gray-400'
                : 'bg-indigo-500'
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Entrar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Links */}
        <View className="space-y-4">
          <TouchableOpacity
            className="items-center"
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text className="text-indigo-500 text-sm">
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center">
            <Text className="text-gray-600 text-sm">
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-indigo-500 text-sm font-medium">
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações de ambiente (dev only) */}
        {__DEV__ && (
          <View className="mt-8 p-3 bg-gray-100 rounded-lg">
            <Text className="text-xs text-gray-600 text-center">
              Ambiente: Desenvolvimento
            </Text>
            <Text className="text-xs text-gray-600 text-center">
              API: http://localhost:8000/api/v1
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
