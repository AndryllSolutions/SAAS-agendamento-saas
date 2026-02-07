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
  FlatList,
  TextInput,
} from 'react-native';
import packagesService from '../services/packagesService';

const PackagesScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const types = [
    { label: 'Todos', value: 'all' },
    { label: 'Personalizados', value: 'custom' },
    { label: 'Pré-definidos', value: 'predefined' },
  ];

  // Carregar pacotes
  useEffect(() => {
    loadPackages();
  }, [filterType]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterType === 'predefined') {
        const result = await packagesService.getPredefinedPackages(filters);
        if (result.success) {
          setPackages(result.data || []);
          applySearch(result.data || [], searchText);
        }
      } else {
        const result = await packagesService.getPackages(filters);
        if (result.success) {
          setPackages(result.data || []);
          applySearch(result.data || [], searchText);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar pacotes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de busca
  const applySearch = (data, query) => {
    if (!query.trim()) {
      setFilteredPackages(data);
      return;
    }

    const filtered = data.filter(
      (pkg) =>
        pkg.name?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPackages(filtered);
  };

  // Atualizar busca
  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(packages, text);
  };

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPackages().finally(() => setRefreshing(false));
  }, [filterType]);

  // Renderizar item de pacote
  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => navigation.navigate('PackageDetails', { packageId: item.id })}
    >
      <View style={styles.packageHeader}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packageDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.packageBadge}>
          <Text style={styles.packageBadgeText}>
            {item.services_count || 0} serviços
          </Text>
        </View>
      </View>

      <View style={styles.packageDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Preço:</Text>
          <Text style={styles.priceValue}>R$ {item.price || '0.00'}</Text>
        </View>
        {item.discount && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Desconto:</Text>
            <Text style={styles.discountValue}>{item.discount}%</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duração:</Text>
          <Text style={styles.detailValue}>{item.duration_days || 'N/A'} dias</Text>
        </View>
      </View>

      <View style={styles.packageFooter}>
        {item.is_active ? (
          <View style={styles.activeStatus}>
            <Text style={styles.activeStatusText}>✓ Ativo</Text>
          </View>
        ) : (
          <View style={styles.inactiveStatus}>
            <Text style={styles.inactiveStatusText}>✗ Inativo</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PackageDetails', { packageId: item.id })}
        >
          <Text style={styles.actionButtonText}>→</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Carregando pacotes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pacotes</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pacote..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {types.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterButton,
              filterType === type.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === type.value && styles.filterButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Packages List */}
      <FlatList
        data={filteredPackages}
        renderItem={renderPackageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum pacote encontrado</Text>
          </View>
        }
      />

      {/* Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePackage')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
    marginRight: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 12,
    color: '#666',
  },
  packageBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  packageBadgeText: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '600',
  },
  packageDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  discountValue: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  activeStatusText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inactiveStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  inactiveStatusText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PackagesScreen;
