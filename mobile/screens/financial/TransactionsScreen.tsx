/**
 * Transactions Screen - Lançamentos Financeiros
 * Baseado no frontend web /financial/transactions
 * Endpoints: GET /financial/transactions, POST /financial/transactions
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { FinancialService, Transaction, TransactionTotals } from '../../services/financial';

const TransactionsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type: routeType, status: routeStatus, action } = route.params as any || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<TransactionTotals | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(routeType || 'all');
  const [showNewModal, setShowNewModal] = useState(action?.startsWith('new_') || false);
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>(
    action === 'new_expense' ? 'expense' : 'income'
  );

  // Form states
  const [formData, setFormData] = useState({
    value: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    account_id: '',
    category_id: '',
    payment_method: '',
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const loadTransactions = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params: any = { page: pageNum, limit: 20 };
      if (filterType !== 'all') params.type = filterType;
      
      const data = await FinancialService.listTransactions(params);
      
      if (append) {
        setTransactions((prev) => [...prev, ...data.items]);
      } else {
        setTransactions(data.items);
      }
      
      setTotals(data.totals);
      setHasMore(data.items.length === 20);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os lançamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [accData, catData] = await Promise.all([
        FinancialService.listAccounts(),
        FinancialService.listCategories(),
      ]);
      setAccounts(accData);
      setCategories(catData);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadFiltersData();
  }, [filterType]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadTransactions(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTransactions(nextPage, true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPaymentMethodLabel = (method: string | null | undefined) => {
    if (!method) return '-';
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      bank_transfer: 'Transferência',
    };
    return labels[method] || method;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'open':
        return 'text-orange-600 bg-orange-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pago',
      open: 'Pendente',
      overdue: 'Vencido',
      available: 'Disponível',
      blocked: 'Bloqueado',
    };
    return labels[status] || status;
  };

  const handleCreateTransaction = async () => {
    if (!formData.value || parseFloat(formData.value) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Informe uma descrição');
      return;
    }

    try {
      await FinancialService.createTransaction({
        type: newTransactionType,
        value: parseFloat(formData.value),
        description: formData.description,
        date: formData.date,
        due_date: formData.due_date || undefined,
        account_id: formData.account_id ? parseInt(formData.account_id) : undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        payment_method: formData.payment_method || undefined,
      });
      
      Alert.alert('Sucesso', 'Lançamento criado com sucesso!');
      setShowNewModal(false);
      setFormData({
        value: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        account_id: '',
        category_id: '',
        payment_method: '',
      });
      loadTransactions();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Erro ao criar lançamento');
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${transaction.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await FinancialService.deleteTransaction(transaction.id);
              Alert.alert('Sucesso', 'Lançamento excluído!');
              loadTransactions();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Lançamentos</Text>
          <TouchableOpacity
            className="bg-white px-3 py-2 rounded-xl"
            onPress={() => setShowNewModal(true)}
          >
            <Text className="text-indigo-600 font-semibold">➕ Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'income', label: 'Receitas' },
            { key: 'expense', label: 'Despesas' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              className={`px-4 py-2 rounded-full mr-2 ${
                filterType === filter.key ? 'bg-indigo-500' : 'bg-gray-100'
              }`}
              onPress={() => setFilterType(filter.key as any)}
            >
              <Text
                className={`font-medium ${
                  filterType === filter.key ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Totais */}
      {totals && (
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-gray-500 text-xs">Recebido</Text>
              <Text className="text-green-600 font-bold">{formatCurrency(totals.received)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-xs">A Receber</Text>
              <Text className="text-blue-600 font-bold">{formatCurrency(totals.to_receive)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-xs">Pago</Text>
              <Text className="text-orange-600 font-bold">{formatCurrency(totals.paid)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-xs">A Pagar</Text>
              <Text className="text-red-600 font-bold">{formatCurrency(totals.to_pay)}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
            loadMore();
          }
        }}
      >
        <View className="p-4">
          {transactions.length === 0 && !loading ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-4xl mb-4">💰</Text>
              <Text className="text-gray-500 text-center mb-4">
                Nenhum lançamento encontrado
              </Text>
              <TouchableOpacity
                className="bg-indigo-500 px-6 py-3 rounded-xl"
                onPress={() => setShowNewModal(true)}
              >
                <Text className="text-white font-semibold">Criar Lançamento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            transactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                className="bg-white rounded-2xl shadow-sm p-4 mb-3"
                onLongPress={() => handleDeleteTransaction(transaction)}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">
                      {transaction.type === 'income' ? '➕' : '➖'}
                    </Text>
                    <View>
                      <Text className="font-bold text-gray-900" numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatDate(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.value)}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      <Text className="text-xs font-medium">
                        {getStatusLabel(transaction.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Detalhes extras */}
                <View className="flex-row flex-wrap mt-2">
                  {transaction.account && (
                    <View className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-gray-600 text-xs">🏦 {transaction.account.name}</Text>
                    </View>
                  )}
                  {transaction.category && (
                    <View className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-gray-600 text-xs">📁 {transaction.category.name}</Text>
                    </View>
                  )}
                  {transaction.payment_method && (
                    <View className="bg-gray-100 rounded-full px-2 py-1 mb-1">
                      <Text className="text-gray-600 text-xs">
                        💳 {getPaymentMethodLabel(transaction.payment_method)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          {loading && page > 1 && (
            <View className="p-4 items-center">
              <Text className="text-gray-500">Carregando mais...</Text>
            </View>
          )}

          <View className="h-8" />
        </View>
      </ScrollView>

      {/* Modal Novo Lançamento */}
      <Modal
        visible={showNewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <ScrollView className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <Text className="text-xl font-bold text-gray-900 mb-4">Novo Lançamento</Text>
            
            {/* Tipo */}
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl mr-2 items-center ${
                  newTransactionType === 'income' ? 'bg-green-500' : 'bg-gray-100'
                }`}
                onPress={() => setNewTransactionType('income')}
              >
                <Text className={`font-semibold ${newTransactionType === 'income' ? 'text-white' : 'text-gray-700'}`}>
                  ➕ Receita
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl ml-2 items-center ${
                  newTransactionType === 'expense' ? 'bg-red-500' : 'bg-gray-100'
                }`}
                onPress={() => setNewTransactionType('expense')}
              >
                <Text className={`font-semibold ${newTransactionType === 'expense' ? 'text-white' : 'text-gray-700'}`}>
                  ➖ Despesa
                </Text>
              </TouchableOpacity>
            </View>

            {/* Valor */}
            <Text className="text-gray-600 mb-2">Valor (R$) *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 text-lg mb-4"
              keyboardType="decimal-pad"
              value={formData.value}
              onChangeText={(text) => setFormData({ ...formData, value: text })}
              placeholder="0,00"
            />

            {/* Descrição */}
            <Text className="text-gray-600 mb-2">Descrição *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 mb-4"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Descrição do lançamento"
            />

            {/* Data */}
            <Text className="text-gray-600 mb-2">Data *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 mb-4"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
              placeholder="YYYY-MM-DD"
            />

            {/* Data de Vencimento */}
            <Text className="text-gray-600 mb-2">Data de Vencimento</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 mb-4"
              value={formData.due_date}
              onChangeText={(text) => setFormData({ ...formData, due_date: text })}
              placeholder="YYYY-MM-DD (opcional)"
            />

            {/* Conta */}
            <Text className="text-gray-600 mb-2">Conta</Text>
            <TouchableOpacity
              className="border border-gray-200 rounded-xl p-4 mb-4"
              onPress={() => {
                Alert.alert(
                  'Selecionar Conta',
                  '',
                  accounts.map((acc) => ({
                    text: acc.name,
                    onPress: () => setFormData({ ...formData, account_id: acc.id.toString() }),
                  })).concat([{ text: 'Cancelar', style: 'cancel' }])
                );
              }}
            >
              <Text className="text-gray-900">
                {accounts.find((a) => a.id.toString() === formData.account_id)?.name || 'Selecione uma conta'}
              </Text>
            </TouchableOpacity>

            {/* Categoria */}
            <Text className="text-gray-600 mb-2">Categoria</Text>
            <TouchableOpacity
              className="border border-gray-200 rounded-xl p-4 mb-4"
              onPress={() => {
                const filteredCategories = categories.filter(
                  (c) => c.type === newTransactionType
                );
                Alert.alert(
                  'Selecionar Categoria',
                  '',
                  filteredCategories.map((cat) => ({
                    text: cat.name,
                    onPress: () => setFormData({ ...formData, category_id: cat.id.toString() }),
                  })).concat([{ text: 'Cancelar', style: 'cancel' }])
                );
              }}
            >
              <Text className="text-gray-900">
                {categories.find((c) => c.id.toString() === formData.category_id)?.name || 'Selecione uma categoria'}
              </Text>
            </TouchableOpacity>

            {/* Forma de Pagamento */}
            <Text className="text-gray-600 mb-2">Forma de Pagamento</Text>
            <TouchableOpacity
              className="border border-gray-200 rounded-xl p-4 mb-6"
              onPress={() => {
                Alert.alert(
                  'Selecionar Forma de Pagamento',
                  '',
                  [
                    { text: 'Dinheiro', onPress: () => setFormData({ ...formData, payment_method: 'cash' }) },
                    { text: 'Cartão de Crédito', onPress: () => setFormData({ ...formData, payment_method: 'credit_card' }) },
                    { text: 'Cartão de Débito', onPress: () => setFormData({ ...formData, payment_method: 'debit_card' }) },
                    { text: 'PIX', onPress: () => setFormData({ ...formData, payment_method: 'pix' }) },
                    { text: 'Boleto', onPress: () => setFormData({ ...formData, payment_method: 'boleto' }) },
                    { text: 'Transferência', onPress: () => setFormData({ ...formData, payment_method: 'bank_transfer' }) },
                    { text: 'Cancelar', style: 'cancel' },
                  ]
                );
              }}
            >
              <Text className="text-gray-900">
                {getPaymentMethodLabel(formData.payment_method) || 'Selecione'}
              </Text>
            </TouchableOpacity>

            {/* Botões */}
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-100 p-4 rounded-xl mr-2"
                onPress={() => {
                  setShowNewModal(false);
                  setFormData({
                    value: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    due_date: '',
                    account_id: '',
                    category_id: '',
                    payment_method: '',
                  });
                }}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-4 rounded-xl ml-2 ${
                  newTransactionType === 'income' ? 'bg-green-500' : 'bg-red-500'
                }`}
                onPress={handleCreateTransaction}
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

export default TransactionsScreen;
