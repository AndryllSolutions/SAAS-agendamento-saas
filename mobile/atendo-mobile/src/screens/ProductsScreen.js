import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import productsService from '../services/productsService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: '',
    stock_minimum: '',
    unit: 'UN',
    price: '',
    cost: '',
    commission_percentage: '',
    barcode: '',
    brand_id: '',
    category_id: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchText, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await productsService.getProducts({ limit: 100 });
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    if (!searchText) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.barcode?.includes(searchText)
    );
    setFilteredProducts(filtered);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      stock: '',
      stock_minimum: '',
      unit: 'UN',
      price: '',
      cost: '',
      commission_percentage: '',
      barcode: '',
      brand_id: '',
      category_id: '',
    });
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      stock: product.stock?.toString() || '',
      stock_minimum: product.stock_minimum?.toString() || '',
      unit: product.unit || 'UN',
      price: product.price?.toString() || '',
      cost: product.cost?.toString() || '',
      commission_percentage: product.commission_percentage?.toString() || '',
      barcode: product.barcode || '',
      brand_id: product.brand_id?.toString() || '',
      category_id: product.category_id?.toString() || '',
    });
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (!formData.name || !formData.price) {
        alert('Nome e preço são obrigatórios');
        return;
      }

      const data = {
        name: formData.name,
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        stock_minimum: parseInt(formData.stock_minimum) || 0,
        unit: formData.unit,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || 0,
        commission_percentage: parseInt(formData.commission_percentage) || 0,
        barcode: formData.barcode,
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      let result;
      if (editingProduct) {
        result = await productsService.updateProduct(editingProduct.id, data);
      } else {
        result = await productsService.createProduct(data);
      }

      if (result.success) {
        alert(editingProduct ? 'Produto atualizado' : 'Produto criado');
        setModalVisible(false);
        loadProducts();
      } else {
        alert(result.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      const result = await productsService.deleteProduct(id);
      if (result.success) {
        alert('Produto deletado');
        loadProducts();
      } else {
        alert(result.error || 'Erro ao deletar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar produto');
    }
  };

  const renderProductItem = ({ item }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        marginHorizontal: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: item.stock > item.stock_minimum ? COLORS.SUCCESS : COLORS.WARNING,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>
          {item.name}
        </Text>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED }}>
          Código: {item.barcode || 'N/A'}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.SUCCESS }}>
            R$ {parseFloat(item.price).toFixed(2)}
          </Text>
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginLeft: SPACING.md }}>
            Estoque: {item.stock}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => handleEditProduct(item)}
          style={{
            backgroundColor: COLORS.PRIMARY,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id)}
          style={{
            backgroundColor: COLORS.DANGER,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="delete" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.PRIMARY,
          padding: SPACING.lg,
          paddingTop: SPACING.xl,
        }}
      >
        <Text style={{ ...TYPOGRAPHY.HEADER, color: '#fff', marginBottom: SPACING.md }}>
          Produtos
        </Text>

        {/* Search */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.MUTED} />
          <TextInput
            placeholder="Buscar por nome ou código"
            value={searchText}
            onChangeText={setSearchText}
            style={{
              flex: 1,
              paddingVertical: SPACING.md,
              marginLeft: SPACING.sm,
              ...TYPOGRAPHY.BODY,
            }}
          />
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="package-variant" size={48} color={COLORS.MUTED} />
            <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>
              Nenhum produto encontrado
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateProduct}
        style={{
          position: 'absolute',
          bottom: SPACING.lg,
          right: SPACING.lg,
          backgroundColor: COLORS.PRIMARY,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              flex: 1,
              marginTop: 50,
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <ScrollView style={{ padding: SPACING.lg }}>
              <Text style={{ ...TYPOGRAPHY.HEADER, marginBottom: SPACING.lg }}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </Text>

              {/* Nome */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Nome *</Text>
              <TextInput
                placeholder="Nome do produto"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Descrição */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Descrição</Text>
              <TextInput
                placeholder="Descrição do produto"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Preço */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Preço *</Text>
              <TextInput
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Custo */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Custo</Text>
              <TextInput
                placeholder="0.00"
                value={formData.cost}
                onChangeText={(text) => setFormData({ ...formData, cost: text })}
                keyboardType="decimal-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Estoque */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Estoque</Text>
              <TextInput
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Estoque Mínimo */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Estoque Mínimo</Text>
              <TextInput
                placeholder="0"
                value={formData.stock_minimum}
                onChangeText={(text) => setFormData({ ...formData, stock_minimum: text })}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Código de Barras */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Código de Barras</Text>
              <TextInput
                placeholder="Código de barras"
                value={formData.barcode}
                onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Comissão */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Comissão (%)</Text>
              <TextInput
                placeholder="0"
                value={formData.commission_percentage}
                onChangeText={(text) => setFormData({ ...formData, commission_percentage: text })}
                keyboardType="number-pad"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Botões */}
              <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    flex: 1,
                    padding: SPACING.md,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.BORDER,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: COLORS.MUTED }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProduct}
                  style={{
                    flex: 1,
                    padding: SPACING.md,
                    borderRadius: 8,
                    backgroundColor: COLORS.PRIMARY,
                  }}
                >
                  <Text style={{ ...TYPOGRAPHY.BODY_BOLD, textAlign: 'center', color: '#fff' }}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
