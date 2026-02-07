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
import invoicesService from '../services/invoicesService';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const INVOICE_TYPES = ['NFe', 'NFSe', 'NFCe'];
const INVOICE_STATUS = ['pending', 'processing', 'issued', 'sent', 'cancelled', 'error'];

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoice_type: 'NFe',
    command_id: '',
    client_id: '',
    total_value: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchText, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await invoicesService.getInvoices({ limit: 100 });
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  };

  const filterInvoices = () => {
    if (!searchText) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(
      (invoice) =>
        invoice.number?.includes(searchText) ||
        invoice.access_key?.includes(searchText)
    );
    setFilteredInvoices(filtered);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      invoice_type: 'NFe',
      command_id: '',
      client_id: '',
      total_value: '',
    });
    setModalVisible(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_type: invoice.invoice_type,
      command_id: invoice.command_id?.toString() || '',
      client_id: invoice.client_id?.toString() || '',
      total_value: invoice.total_value?.toString() || '',
    });
    setModalVisible(true);
  };

  const handleSaveInvoice = async () => {
    try {
      if (!formData.total_value || !formData.invoice_type) {
        alert('Tipo e valor são obrigatórios');
        return;
      }

      const data = {
        invoice_type: formData.invoice_type,
        command_id: formData.command_id ? parseInt(formData.command_id) : null,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        total_value: parseFloat(formData.total_value),
      };

      let result;
      if (editingInvoice) {
        result = await invoicesService.updateInvoice(editingInvoice.id, data);
      } else {
        result = await invoicesService.createInvoice(data);
      }

      if (result.success) {
        alert(editingInvoice ? 'Nota fiscal atualizada' : 'Nota fiscal criada');
        setModalVisible(false);
        loadInvoices();
      } else {
        alert(result.error || 'Erro ao salvar nota fiscal');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar nota fiscal');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta nota fiscal?')) return;

    try {
      const result = await invoicesService.deleteInvoice(id);
      if (result.success) {
        alert('Nota fiscal deletada');
        loadInvoices();
      } else {
        alert(result.error || 'Erro ao deletar nota fiscal');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar nota fiscal');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'issued':
        return COLORS.SUCCESS;
      case 'sent':
        return COLORS.INFO;
      case 'pending':
      case 'processing':
        return COLORS.WARNING;
      case 'cancelled':
      case 'error':
        return COLORS.DANGER;
      default:
        return COLORS.MUTED;
    }
  };

  const renderInvoiceItem = ({ item }) => (
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.BODY_BOLD, color: COLORS.PRIMARY }}>
            {item.number || 'Sem número'}
          </Text>
          <View
            style={{
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: SPACING.sm,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: SPACING.sm,
            }}
          >
            <Text style={{ ...TYPOGRAPHY.CAPTION, color: '#fff' }}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED }}>
          Tipo: {item.invoice_type}
        </Text>
        <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.SUCCESS, marginTop: SPACING.xs }}>
          R$ {parseFloat(item.total_value).toFixed(2)}
        </Text>
        {item.issue_date && (
          <Text style={{ ...TYPOGRAPHY.CAPTION, color: COLORS.MUTED, marginTop: SPACING.xs }}>
            {new Date(item.issue_date).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => handleEditInvoice(item)}
          style={{
            backgroundColor: COLORS.PRIMARY,
            padding: SPACING.sm,
            borderRadius: 6,
          }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteInvoice(item.id)}
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
          Notas Fiscais
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
            placeholder="Buscar por número ou chave"
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

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialCommunityIcons name="file-document" size={48} color={COLORS.MUTED} />
            <Text style={{ ...TYPOGRAPHY.BODY, color: COLORS.MUTED, marginTop: SPACING.md }}>
              Nenhuma nota fiscal encontrada
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={handleCreateInvoice}
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
                {editingInvoice ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
              </Text>

              {/* Tipo */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Tipo *</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 8,
                  marginBottom: SPACING.md,
                }}
              >
                {INVOICE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, invoice_type: type })}
                    style={{
                      padding: SPACING.md,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.BORDER,
                      backgroundColor:
                        formData.invoice_type === type ? COLORS.PRIMARY + '20' : '#fff',
                    }}
                  >
                    <Text
                      style={{
                        ...TYPOGRAPHY.BODY,
                        color: formData.invoice_type === type ? COLORS.PRIMARY : COLORS.MUTED,
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Valor Total */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>Valor Total *</Text>
              <TextInput
                placeholder="0.00"
                value={formData.total_value}
                onChangeText={(text) => setFormData({ ...formData, total_value: text })}
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

              {/* ID da Comanda */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>ID da Comanda</Text>
              <TextInput
                placeholder="ID da comanda"
                value={formData.command_id}
                onChangeText={(text) => setFormData({ ...formData, command_id: text })}
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

              {/* ID do Cliente */}
              <Text style={{ ...TYPOGRAPHY.LABEL, marginBottom: SPACING.xs }}>ID do Cliente</Text>
              <TextInput
                placeholder="ID do cliente"
                value={formData.client_id}
                onChangeText={(text) => setFormData({ ...formData, client_id: text })}
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
                  onPress={handleSaveInvoice}
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
