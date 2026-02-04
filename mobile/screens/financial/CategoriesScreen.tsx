/**
 * Categories Screen - Categorias Financeiras
 * Baseado no frontend web /financial/categories
 * Endpoints: GET /financial/categories, POST /financial/categories, PUT /financial/categories/{id}, DELETE
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
import { FinancialService, FinancialCategory } from '../../services/financial';

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FinancialCategory | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#6366f1',
  });

  const colors = [
    '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280'
  ];

  const loadCategories = async () => {
    try {
      setLoading(true);
      const type = filterType === 'all' ? undefined : filterType;
      const data = await FinancialService.listCategories(type);
      setCategories(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [filterType]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const getTypeLabel = (type: string) => {
    return type === 'income' ? '➕ Receita' : '➖ Despesa';
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Informe o nome da categoria');
      return;
    }

    try {
      if (isEditing && selectedCategory) {
        await FinancialService.updateCategory(selectedCategory.id, {
          name: formData.name,
          type: formData.type,
          color: formData.color,
        });
        Alert.alert('Sucesso', 'Categoria atualizada!');
      } else {
        await FinancialService.createCategory({
          name: formData.name,
          type: formData.type,
          color: formData.color,
        });
        Alert.alert('Sucesso', 'Categoria criada!');
      }
      
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = (category: FinancialCategory) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await FinancialService.deleteCategory(category.id);
              Alert.alert('Sucesso', 'Categoria excluída!');
              loadCategories();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (category: FinancialCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#6366f1',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#6366f1',
    });
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const CategorySection = ({ title, items, color }: { title: string; items: FinancialCategory[]; color: string }) => (
    <View className="mb-4">
      <Text className={`text-lg font-bold ${color} mb-2`}>{title} ({items.length})</Text>
      {items.map((category) => (
        <TouchableOpacity
          key={category.id}
          className="bg-white rounded-xl shadow-sm p-4 mb-2 flex-row items-center"
          onPress={() => openEditModal(category)}
          onLongPress={() => handleDelete(category)}
        >
          <View
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: category.color || '#6366f1' }}
          />
          <Text className="flex-1 font-medium text-gray-900">{category.name}</Text>
          <View className={`px-2 py-1 rounded-full ${category.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs ${category.is_active ? 'text-green-600' : 'text-gray-600'}`}>
              {category.is_active ? 'Ativa' : 'Inativa'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-500 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Categorias</Text>
          <TouchableOpacity
            className="bg-white px-3 py-2 rounded-xl"
            onPress={openCreateModal}
          >
            <Text className="text-indigo-600 font-semibold">➕ Nova</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todas' },
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

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          {categories.length === 0 && !loading ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-4xl mb-4">📁</Text>
              <Text className="text-gray-500 text-center mb-4">
                Nenhuma categoria encontrada
              </Text>
              <TouchableOpacity
                className="bg-indigo-500 px-6 py-3 rounded-xl"
                onPress={openCreateModal}
              >
                <Text className="text-white font-semibold">Criar Categoria</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {(filterType === 'all' || filterType === 'income') && (
                <CategorySection
                  title="📈 Categorias de Receita"
                  items={incomeCategories}
                  color="text-green-600"
                />
              )}
              {(filterType === 'all' || filterType === 'expense') && (
                <CategorySection
                  title="📉 Categorias de Despesa"
                  items={expenseCategories}
                  color="text-red-600"
                />
              )}
            </>
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
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            
            {/* Tipo */}
            <Text className="text-gray-600 mb-2">Tipo</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl mr-2 items-center ${
                  formData.type === 'income' ? 'bg-green-500' : 'bg-gray-100'
                }`}
                onPress={() => setFormData({ ...formData, type: 'income' })}
              >
                <Text className={`font-semibold ${formData.type === 'income' ? 'text-white' : 'text-gray-700'}`}>
                  ➕ Receita
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-xl ml-2 items-center ${
                  formData.type === 'expense' ? 'bg-red-500' : 'bg-gray-100'
                }`}
                onPress={() => setFormData({ ...formData, type: 'expense' })}
              >
                <Text className={`font-semibold ${formData.type === 'expense' ? 'text-white' : 'text-gray-700'}`}>
                  ➖ Despesa
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nome */}
            <Text className="text-gray-600 mb-2">Nome da Categoria *</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 mb-4"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Alimentação"
            />

            {/* Cor */}
            <Text className="text-gray-600 mb-2">Cor</Text>
            <View className="flex-row flex-wrap mb-6">
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-12 h-12 rounded-full m-1 ${
                    formData.color === color ? 'border-2 border-gray-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => setFormData({ ...formData, color })}
                />
              ))}
            </View>

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

export default CategoriesScreen;
