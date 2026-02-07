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
import purchasesService from '../services/purchasesService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cellphone: '',
    cpf: '',
    cnpj: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [searchText, suppliers]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const result = await purchasesService.getSuppliers({ limit: 100 });
      if (result.success) {
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  };

  const filterSuppliers = () => {
    if (!searchText) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.email?.includes(searchText) ||
        supplier.phone?.includes(searchText)
    );
    setFilteredSuppliers(filtered);
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cellphone: '',
      cpf: '',
      cnpj: '',
      address: '',
      address_number: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      cellphone: supplier.cellphone || '',
      cpf: supplier.cpf || '',
      cnpj: supplier.cnpj || '',
      address: supplier.address || '',
      address_number: supplier.address_number || '',
      address_complement: supplier.address_complement || '',
      neighborhood: supplier.neighborhood || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zip_code: supplier.zip_code || '',
      notes: supplier.notes || '',
    });
    setModalVisible(true);
  };

  const handleSaveSupplier = async () => {
    try {
      if (!formData.name) {
        alert('Nome é obrigatório');
        return;
      }

      const data = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cellphone: formData.cellphone,
        cpf: formData.cpf,
        cnpj: formData.cnpj,
        address: formData.address,
        address_number: formData.address_number,
        address_complement: formData.address_complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        notes: formData.notes,
      };

      let result;
      if (editingSupplier) {
        result = await purchasesService.updateSupplier(editingSupplier.id, data);
      } else {
        result = await purchasesService.createSupplier(data);
      }

      if (result.success) {
        alert(editingSupplier ? 'Fornecedor atualizado' : 'Fornecedor criado');
        setModalVisible(false);
        loadSuppliers();
      } else {
        alert(result.error || 'Erro ao salvar fornecedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar fornecedor');
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return;

    try {
      const result = await purchasesService.deleteSupplier(id);
      if (result.success) {
        alert('Fornecedor deletado');
        loadSuppliers();
      } else {
        alert(result.error || 'Erro ao deletar fornecedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar fornecedor');
    }
  };

  const renderSupplierItem = ({ item }) => (
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
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>
          {item.name}
        </Text>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED }}>
          {item.email || item.phone || 'Sem contato'}
        </Text>
        {item.city && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>
            {item.city}, {item.state}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => handleEditSupplier(item)}
          style={{
            backgroundColor: COLORS.PRIMARY,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteSupplier(item.id)}
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
          Fornecedores
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
            placeholder="Buscar por nome ou email"
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

      {/* Suppliers List */}
      <FlatList
        data={filteredSuppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="truck" size={48} color={COLORS.MUTED} />
            <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>
              Nenhum fornecedor encontrado
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateSupplier}
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
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </Text>

              {/* Nome */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Nome *</Text>
              <TextInput
                placeholder="Nome do fornecedor"
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

              {/* Email */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Email</Text>
              <TextInput
                placeholder="email@exemplo.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Telefone */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Telefone</Text>
              <TextInput
                placeholder="(11) 3000-0000"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Celular */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Celular</Text>
              <TextInput
                placeholder="(11) 99999-9999"
                value={formData.cellphone}
                onChangeText={(text) => setFormData({ ...formData, cellphone: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* CNPJ */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>CNPJ</Text>
              <TextInput
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChangeText={(text) => setFormData({ ...formData, cnpj: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Endereço */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Endereço</Text>
              <TextInput
                placeholder="Rua..."
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Número */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Número</Text>
              <TextInput
                placeholder="123"
                value={formData.address_number}
                onChangeText={(text) => setFormData({ ...formData, address_number: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Complemento */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Complemento</Text>
              <TextInput
                placeholder="Apto, sala, etc"
                value={formData.address_complement}
                onChangeText={(text) => setFormData({ ...formData, address_complement: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Bairro */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Bairro</Text>
              <TextInput
                placeholder="Bairro"
                value={formData.neighborhood}
                onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Cidade */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Estado */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Estado</Text>
              <TextInput
                placeholder="SP"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
                maxLength={2}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* CEP */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>CEP</Text>
              <TextInput
                placeholder="00000-000"
                value={formData.zip_code}
                onChangeText={(text) => setFormData({ ...formData, zip_code: text })}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                  ...TYPOGRAPHY.BODY,
                }}
              />

              {/* Notas */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Notas</Text>
              <TextInput
                placeholder="Observações"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
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
                  onPress={handleSaveSupplier}
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
