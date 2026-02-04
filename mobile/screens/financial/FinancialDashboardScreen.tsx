/**
 * Financial Dashboard Screen - Dashboard Financeiro
 * Baseado no frontend web /financial/dashboard
 * Endpoints: GET /financial/dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FinancialService, FinancialDashboardData } from '../../services/financial';

const FinancialDashboardScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<FinancialDashboardData | null>(null);
  const [periodType, setPeriodType] = useState<'today' | '7days' | '30days' | 'month'>('30days');

  const getPeriodDates = (type: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (type) {
      case 'today':
        return { start_date: formatDate(today), end_date: formatDate(today) };
      case '7days':
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start_date: formatDate(sevenDaysAgo), end_date: formatDate(today) };
      case '30days':
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start_date: formatDate(thirtyDaysAgo), end_date: formatDate(today) };
      case 'month':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start_date: formatDate(firstDay), end_date: formatDate(lastDay) };
      default:
        const defaultDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start_date: formatDate(defaultDaysAgo), end_date: formatDate(today) };
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const period = getPeriodDates(periodType);
      const data = await FinancialService.getDashboard(period);
      setDashboard(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o dashboard financeiro');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [periodType]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    color,
    icon,
    onPress,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    color: string;
    icon: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-sm p-4 mb-3 border-l-4"
      style={{ borderLeftColor: color }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-600 text-sm font-medium">{title}</Text>
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      {subtitle && <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>}
    </TouchableOpacity>
  );

  const SummaryCard = ({
    title,
    value,
    color,
  }: {
    title: string;
    value: string;
    color: string;
  }) => (
    <View className="bg-white rounded-xl p-3 flex-1 mx-1">
      <Text className="text-gray-500 text-xs mb-1">{title}</Text>
      <Text className={`text-lg font-bold ${color}`}>{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <Text className="text-white text-xl font-bold">Financeiro</Text>
        <Text className="text-indigo-200 text-sm">Visão geral da situação financeira</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Period Selector */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'today', label: 'Hoje' },
              { key: '7days', label: '7 dias' },
              { key: '30days', label: '30 dias' },
              { key: 'month', label: 'Este mês' },
            ].map((period) => (
              <TouchableOpacity
                key={period.key}
                className={`px-4 py-2 rounded-full mr-2 ${
                  periodType === period.key ? 'bg-indigo-500' : 'bg-gray-100'
                }`}
                onPress={() => setPeriodType(period.key as any)}
              >
                <Text
                  className={`font-medium ${
                    periodType === period.key ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && !dashboard ? (
          <View className="p-8 items-center">
            <Text className="text-gray-500">Carregando...</Text>
          </View>
        ) : dashboard ? (
          <View className="p-4">
            {/* A Receber / A Pagar Hoje */}
            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">Resumo de Hoje</Text>
              <View className="flex-row">
                <SummaryCard
                  title="A Receber"
                  value={formatCurrency(dashboard.to_receive_today)}
                  color="text-green-600"
                />
                <SummaryCard
                  title="A Pagar"
                  value={formatCurrency(dashboard.to_pay_today)}
                  color="text-red-600"
                />
              </View>
            </View>

            {/* Posição Caixa / Banco */}
            <View className="bg-white rounded-2xl shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">Posição Financeira</Text>
              <View className="flex-row">
                <View className="flex-1 bg-green-50 rounded-xl p-3 mr-2">
                  <Text className="text-gray-600 text-sm mb-1">💵 Caixa</Text>
                  <Text className="text-xl font-bold text-green-700">
                    {formatCurrency(dashboard.cash_position)}
                  </Text>
                </View>
                <View className="flex-1 bg-blue-50 rounded-xl p-3 ml-2">
                  <Text className="text-gray-600 text-sm mb-1">🏦 Banco</Text>
                  <Text className="text-xl font-bold text-blue-700">
                    {formatCurrency(dashboard.bank_position)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cards de Totais do Período */}
            <Text className="text-gray-800 font-bold text-lg mb-3">Totais do Período</Text>
            
            <StatCard
              title="Recebidos"
              value={formatCurrency(dashboard.total_received_period)}
              subtitle="Total recebido"
              color="#22c55e"
              icon="💰"
              onPress={() => navigation.navigate('Transactions', { type: 'income' })}
            />

            <StatCard
              title="A Receber"
              value={formatCurrency(dashboard.total_to_receive_period)}
              subtitle="Pendente de recebimento"
              color="#3b82f6"
              icon="📥"
              onPress={() => navigation.navigate('Transactions', { type: 'income', status: 'pending' })}
            />

            <StatCard
              title="Pagos"
              value={formatCurrency(dashboard.total_paid_period)}
              subtitle="Total pago"
              color="#f97316"
              icon="💸"
              onPress={() => navigation.navigate('Transactions', { type: 'expense' })}
            />

            <StatCard
              title="A Pagar"
              value={formatCurrency(dashboard.total_to_pay_period)}
              subtitle="Pendente de pagamento"
              color="#ef4444"
              icon="📤"
              onPress={() => navigation.navigate('Transactions', { type: 'expense', status: 'pending' })}
            />

            {/* Ações Rápidas */}
            <Text className="text-gray-800 font-bold text-lg mb-3 mt-4">Ações Rápidas</Text>
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-indigo-500 p-4 rounded-2xl mr-2 items-center"
                onPress={() => navigation.navigate('CashRegisters')}
              >
                <Text className="text-2xl mb-1">🧾</Text>
                <Text className="text-white font-semibold text-sm">Caixas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-green-500 p-4 rounded-2xl mx-1 items-center"
                onPress={() => navigation.navigate('Transactions', { action: 'new_income' })}
              >
                <Text className="text-2xl mb-1">➕</Text>
                <Text className="text-white font-semibold text-sm">Receita</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-500 p-4 rounded-2xl ml-2 items-center"
                onPress={() => navigation.navigate('Transactions', { action: 'new_expense' })}
              >
                <Text className="text-2xl mb-1">➖</Text>
                <Text className="text-white font-semibold text-sm">Despesa</Text>
              </TouchableOpacity>
            </View>

            {/* Espaço no final */}
            <View className="h-8" />
          </View>
        ) : (
          <View className="p-8 items-center">
            <Text className="text-gray-500">Nenhum dado disponível</Text>
            <TouchableOpacity className="mt-4 bg-indigo-500 px-6 py-3 rounded-xl" onPress={loadDashboard}>
              <Text className="text-white font-semibold">Recarregar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FinancialDashboardScreen;
