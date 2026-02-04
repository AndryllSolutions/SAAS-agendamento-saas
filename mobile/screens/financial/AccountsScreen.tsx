/**
 * Accounts Screen - Contas Bancárias
 * Baseado no frontend web /financial/accounts
 * Endpoints: GET /financial/accounts, POST /financial/accounts, PUT /financial/accounts/{id}, DELETE
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
import { FinancialService, FinancialAccount } from '../../services/financial';

const AccountsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<FinancialAccount | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'bank' | 'other',
    initial_balance: '',
  });

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await FinancialService.listAccounts();
      setAccounts(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as contas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAccounts();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: '💵 Dinheiro',
      bank: '🏦 Banco',
      other: '📄 Outro',
    };
    return labels[type] || type;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Informe o nome da conta');
      return;
    }

    try {
      if (isEditing && selectedAccount) {
        await FinancialService.updateAccount(selectedAccount.id, {
          name: formData.name,
          type: formData.type,
        });
        Alert.alert('Sucesso', 'Conta atualizada!');
      } else {
        await FinancialService.createAccount({
          name: formData.name,
          type: formData.type,
          initial_balance: formData.initial_balance ? parseFloat(formData.initial_balance) : 0,
        });
        Alert.alert('Sucesso', 'Conta criada!');
      }
      
      setShowModal(false);
      resetForm();
      loadAccounts();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Erro ao salvar conta');
    }
  };

  const handleDelete = (account: FinancialAccount) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${account.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await FinancialService.deleteAccount(account.id);
              Alert.alert('Sucesso', 'Conta excluída!');
              loadAccounts();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (account: FinancialAccount) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      initial_balance: '',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedAccount(null);
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'cash',
      initial_balance: '',
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Contas Bancárias</Text>
          <TouchableOpacity
            className="bg-white px-3 py-2 rounded-xl"
            onPress={openCreateModal}
          >
            <Text className="text-indigo-600 font-semibold">➕ Nova</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total Balance */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-gray-500 text-sm">Saldo Total em Contas</Text>
        <Text className="text-3xl font-bold text-indigo-600">
          {formatCurrency(totalBalance)}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          {accounts.length === 0 && !loading ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-4xl mb-4">🏦</Text>
              <Text className="text-gray-500 text-center mb-4">
                Nenhuma conta encontrada
              </Text>
              <TouchableOpacity
                className="bg-indigo-500 px-6 py-3 rounded-xl"
                onPress={openCreateModal}
              >
                <Text className="text-white font-semibold">Criar Conta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                className="bg-white rounded-2xl shadow-sm p-4 mb-3"
                onPress={() => openEditModal(account)}
                onLongPress={() => handleDelete(account)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-2xl mr-2">
                        {account.type === 'cash' ? '💵' : account.type === 'bank' ? '🏦' : '📄'}
                      </Text>
                      <Text className="font-bold text-gray-900 text-lg">{account.name}</Text>
                    </View>
                    <Text className="text-gray-500 text-sm ml-8">
                      {getTypeLabel(account.type)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${account.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Text className={`text-xs ${account.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                        {account.is_active ? 'Ativa' : 'Inativa'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View className="h-8" />
        </View>
      </ScrollView>

      {/* Modal Criar/Editar */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <ScrollView className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Editar Conta' : 'Nova Conta'}
            </Text>
            
            {/* Nome */}
            <Text className="text-gray-600 mb-2">Nome da Conta *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 mb-4"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Caixa Principal"
            />

            {/* Tipo */}
            <Text className="text-gray-600 mb-2">Tipo</Text>
            <View className="flex-row mb-4">
              {(['cash', 'bank', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 p-3 rounded-xl mr-2 items-center ${
                    formData.type === type ? 'bg-indigo-500' : 'bg-gray-100'
                  }`}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text className={`font-semibold ${formData.type === type ? 'text-white' : 'text-gray-700'}`}>
                    {type === 'cash' ? '💵 Dinheiro' : type === 'bank' ? '🏦 Banco' : '📄 Outro'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Saldo Inicial (apenas na criação) */}
            {!isEditing && (
              <>
                <Text className="text-gray-600 mb-2">Saldo Inicial (R$)</Text>
                <TextInput
                  className="border border-gray-200 rounded-xl p-4 mb-6"
                  keyboardType="decimal-pad"
                  value={formData.initial_balance}
                  onChangeText={(text) => setFormData({ ...formData, initial_balance: text })}
                  placeholder="0,00"
                />
              </>
            )}

            {/* Botões */}
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-4 rounded-xl mr-2"
                onPress={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-500 p-4 rounded-xl ml-2"
                onPress={handleSave}
              >
                <Text className="text-white font-semibold text-center">Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default AccountsScreen;
