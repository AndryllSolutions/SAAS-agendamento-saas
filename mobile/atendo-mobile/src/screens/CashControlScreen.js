import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import financialService from '../services/financialService';

const CashControlScreen = ({ navigation }) => {
  const [cashStatus, setCashStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Carregar status do caixa
  useEffect(() => {
    loadCashStatus();
  }, []);

  const loadCashStatus = async () => {
    try {
      setLoading(true);
      const result = await financialService.getCashStatus();
      if (result.success) {
        setCashStatus(result.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar status do caixa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCashStatus().finally(() => setRefreshing(false));
  }, []);

  // Abrir caixa
  const handleOpenCash = async () => {
    if (!openingAmount.trim()) {
      Alert.alert('Erro', 'Informe o valor de abertura');
      return;
    }

    try {
      const result = await financialService.openCash({
        opening_amount: parseFloat(openingAmount),
        notes,
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Caixa aberto com sucesso');
        setOpeningAmount('');
        setNotes('');
        setShowOpenModal(false);
        loadCashStatus();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao abrir caixa');
    }
  };

  // Fechar caixa
  const handleCloseCash = async () => {
    if (!closingAmount.trim()) {
      Alert.alert('Erro', 'Informe o valor de fechamento');
      return;
    }

    try {
      const result = await financialService.closeCash({
        closing_amount: parseFloat(closingAmount),
        notes,
      });

      if (result.success) {
        Alert.alert('Sucesso', 'Caixa fechado com sucesso');
        setClosingAmount('');
        setNotes('');
        setShowCloseModal(false);
        loadCashStatus();
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fechar caixa');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando status do caixa...</Text>
      </View>
    );
  }

  const isCashOpen = cashStatus?.status === 'open';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Controle de Caixa</Text>
      </View>

      {/* Cash Status Card */}
      <View style={[styles.statusCard, { borderLeftColor: isCashOpen ? '#4CAF50' : '#F44336' }]}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Status do Caixa</Text>
          <View style={[styles.statusBadge, { backgroundColor: isCashOpen ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusBadgeText}>{isCashOpen ? 'ABERTO' : 'FECHADO'}</Text>
          </View>
        </View>

        {isCashOpen && (
          <View style={styles.statusContent}>
            <View style={styles.statusRow}>
              <Text style={styles.statusRowLabel}>Abertura:</Text>
              <Text style={styles.statusRowValue}>
                {new Date(cashStatus.opened_at).toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusRowLabel}>Valor de Abertura:</Text>
              <Text style={styles.statusRowValue}>R$ {cashStatus.opening_amount}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusRowLabel}>Operador:</Text>
              <Text style={styles.statusRowValue}>{cashStatus.operator_name}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Cash Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo do Dia</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Receita</Text>
            <Text style={[styles.summaryItemValue, { color: '#4CAF50' }]}>
              R$ {cashStatus?.daily_revenue || '0.00'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Despesa</Text>
            <Text style={[styles.summaryItemValue, { color: '#F44336' }]}>
              R$ {cashStatus?.daily_expenses || '0.00'}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Saldo</Text>
            <Text style={[styles.summaryItemValue, { color: '#0066cc' }]}>
              R$ {cashStatus?.daily_balance || '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Transactions Summary */}
      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Transações do Dia</Text>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Pagamentos em Dinheiro:</Text>
          <Text style={styles.transactionValue}>{cashStatus?.cash_payments || 0}</Text>
        </View>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Pagamentos em Cartão:</Text>
          <Text style={styles.transactionValue}>{cashStatus?.card_payments || 0}</Text>
        </View>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Pagamentos em PIX:</Text>
          <Text style={styles.transactionValue}>{cashStatus?.pix_payments || 0}</Text>
        </View>

        <View style={styles.transactionRow}>
          <Text style={styles.transactionLabel}>Reembolsos:</Text>
          <Text style={styles.transactionValue}>{cashStatus?.refunds || 0}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!isCashOpen ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.openButton]}
            onPress={() => setShowOpenModal(true)}
          >
            <Text style={styles.actionButtonText}>Abrir Caixa</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={() => setShowCloseModal(true)}
          >
            <Text style={styles.actionButtonText}>Fechar Caixa</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Open Cash Modal */}
      <Modal
        visible={showOpenModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOpenModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Abrir Caixa</Text>

            <TextInput
              style={styles.input}
              placeholder="Valor de abertura"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={openingAmount}
              onChangeText={setOpeningAmount}
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Observações (opcional)"
              placeholderTextColor="#999"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowOpenModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleOpenCash}
              >
                <Text style={styles.modalButtonText}>Abrir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Close Cash Modal */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fechar Caixa</Text>

            <TextInput
              style={styles.input}
              placeholder="Valor de fechamento"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={closingAmount}
              onChangeText={setClosingAmount}
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Observações (opcional)"
              placeholderTextColor="#999"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCloseCash}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusRowLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusRowValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  transactionRow: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLabel: {
    fontSize: 12,
    color: '#666',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  openButton: {
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CashControlScreen;
