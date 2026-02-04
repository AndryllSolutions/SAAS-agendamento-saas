/**
 * Cash Registers Screen - Controle de Caixas/PDV
 * Baseado no frontend web /financial/cash-registers
 * Endpoints: GET /financial/cash-registers, POST /financial/cash-registers/open, POST /financial/cash-registers/{id}/close
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FinancialService, CashRegister, CashRegisterConference } from '../../services/financial';
import { useAuthStore } from '../../store/authStore';

const CashRegistersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null);
  const [conferenceData, setConferenceData] = useState<CashRegisterConference | null>(null);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');

  const loadCashRegisters = async () => {
    try {
      setLoading(true);
      const data = await FinancialService.listCashRegisters();
      setCashRegisters(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os caixas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCashRegisters();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCashRegisters();
  };

  const formatCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenCashRegister = async () => {
    if (!openingBalance || parseFloat(openingBalance) < 0) {
      Alert.alert('Erro', 'Informe um valor válido para o saldo inicial');
      return;
    }

    try {
      await FinancialService.openCashRegister({
        company_id: user?.company_id || 0,
        opening_balance: parseFloat(openingBalance),
      });
      Alert.alert('Sucesso', 'Caixa aberto com sucesso!');
      setShowOpenModal(false);
      setOpeningBalance('');
      loadCashRegisters();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Erro ao abrir caixa');
    }
  };

  const handleCloseCashRegister = async () => {
    if (!selectedRegister) return;
    
    if (closingBalance === '' || parseFloat(closingBalance) < 0) {
      Alert.alert('Erro', 'Informe um valor válido para o saldo de fechamento');
      return;
    }

    try {
      await FinancialService.closeCashRegister(selectedRegister.id, {
        closing_balance: parseFloat(closingBalance),
      });
      Alert.alert('Sucesso', 'Caixa fechado com sucesso!');
      setShowCloseModal(false);
      setClosingBalance('');
      setSelectedRegister(null);
      loadCashRegisters();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fechar caixa');
    }
  };

  const loadConferenceData = async (register: CashRegister) => {
    try {
      const data = await FinancialService.getCashRegisterConference(register.id);
      setConferenceData(data);
    } catch (error) {
      setConferenceData({
        opening_balance: register.opening_balance || 0,
        movements: 0,
        cash_balance: register.opening_balance || 0,
        other_payments: {},
        total_received: 0,
        total_to_receive: 0,
        payment_summary: {},
      });
    }
  };

  const openCloseModal = async (register: CashRegister) => {
    setSelectedRegister(register);
    await loadConferenceData(register);
    setShowCloseModal(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    return status === 'open' ? 'Aberto' : 'Fechado';
  };

  const hasOpenRegister = cashRegisters.some((r) => r.status === 'open');

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">Caixas / PDV</Text>
            <Text className="text-indigo-200 text-sm">Controle de caixas</Text>
          </View>
          {!hasOpenRegister && (
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-xl"
              onPress={() => setShowOpenModal(true)}
            >
              <Text className="text-indigo-600 font-semibold">Abrir Caixa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !cashRegisters.length ? (
          <View className="p-8 items-center">
            <Text className="text-gray-500">Carregando...</Text>
          </View>
        ) : (
          <View className="p-4">
            {cashRegisters.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center">
                <Text className="text-4xl mb-4">🧾</Text>
                <Text className="text-gray-500 text-center mb-4">
                  Nenhum caixa encontrado
                </Text>
                <TouchableOpacity
                  className="bg-indigo-500 px-6 py-3 rounded-xl"
                  onPress={() => setShowOpenModal(true)}
                >
                  <Text className="text-white font-semibold">Abrir Primeiro Caixa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              cashRegisters.map((register) => (
                <View
                  key={register.id}
                  className="bg-white rounded-2xl shadow-sm p-4 mb-3"
                >
                  {/* Header do Caixa */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className={`w-3 h-3 rounded-full mr-2 ${register.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <Text className="font-bold text-gray-900">Caixa #{register.id}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(register.status)}`}>
                      <Text className="text-sm font-medium">{getStatusLabel(register.status)}</Text>
                    </View>
                  </View>

                  {/* Informações */}
                  <View className="space-y-2 mb-4">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Abertura:</Text>
                      <Text className="text-gray-900">{formatDateTime(register.opened_at)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Saldo Inicial:</Text>
                      <Text className="text-gray-900 font-medium">
                        {formatCurrency(register.opening_balance)}
                      </Text>
                    </View>
                    {register.status === 'closed' && (
                      <>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500">Fechamento:</Text>
                          <Text className="text-gray-900">{formatDateTime(register.closed_at)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-gray-500">Saldo Final:</Text>
                          <Text className="text-gray-900 font-medium">
                            {formatCurrency(register.closing_balance)}
                          </Text>
                        </View>
                      </>
                    )}
                    {register.user_name && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500">Operador:</Text>
                        <Text className="text-gray-900">{register.user_name}</Text>
                      </View>
                    )}
                  </View>

                  {/* Totais de Vendas (se houver) */}
                  {register.total_sales !== undefined && (
                    <View className="bg-gray-50 rounded-xl p-3 mb-3">
                      <Text className="text-gray-500 text-sm mb-2">Resumo de Vendas</Text>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-600">Total:</Text>
                        <Text className="text-gray-900 font-medium">
                          {formatCurrency(register.total_sales)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-xs">Dinheiro:</Text>
                        <Text className="text-gray-900 text-xs">
                          {formatCurrency(register.total_cash)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-xs">Cartão:</Text>
                        <Text className="text-gray-900 text-xs">
                          {formatCurrency(register.total_card)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600 text-xs">PIX:</Text>
                        <Text className="text-gray-900 text-xs">
                          {formatCurrency(register.total_pix)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Ações */}
                  {register.status === 'open' && (
                    <TouchableOpacity
                      className="bg-red-500 p-3 rounded-xl items-center"
                      onPress={() => openCloseModal(register)}
                    >
                      <Text className="text-white font-semibold">🔒 Fechar Caixa</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Abrir Caixa */}
      <Modal
        visible={showOpenModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOpenModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Abrir Caixa</Text>
            
            <Text className="text-gray-600 mb-2">Saldo Inicial (R$)</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 text-lg mb-6"
              keyboardType="decimal-pad"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              placeholder="0,00"
            />

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-4 rounded-xl mr-2"
                onPress={() => {
                  setShowOpenModal(false);
                  setOpeningBalance('');
                }}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-500 p-4 rounded-xl ml-2"
                onPress={handleOpenCashRegister}
              >
                <Text className="text-white font-semibold text-center">Abrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Fechar Caixa */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <ScrollView className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold text-gray-900 mb-4">Fechar Caixa</Text>
            
            {conferenceData && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-600 text-sm mb-2">Conferência</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Saldo Inicial:</Text>
                  <Text className="text-gray-900">{formatCurrency(conferenceData.opening_balance)}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Movimentos:</Text>
                  <Text className="text-gray-900">{formatCurrency(conferenceData.movements)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-medium">Saldo Esperado:</Text>
                  <Text className="text-gray-900 font-medium">
                    {formatCurrency(conferenceData.cash_balance)}
                  </Text>
                </View>
              </View>
            )}
            
            <Text className="text-gray-600 mb-2">Saldo de Fechamento (R$)</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 text-lg mb-6"
              keyboardType="decimal-pad"
              value={closingBalance}
              onChangeText={setClosingBalance}
              placeholder="0,00"
            />

            <View className="flex-row mb-4">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-4 rounded-xl mr-2"
                onPress={() => {
                  setShowCloseModal(false);
                  setClosingBalance('');
                  setSelectedRegister(null);
                }}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 p-4 rounded-xl ml-2"
                onPress={handleCloseCashRegister}
              >
                <Text className="text-white font-semibold text-center">Fechar Caixa</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default CashRegistersScreen;
