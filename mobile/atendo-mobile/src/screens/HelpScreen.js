import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchText, setSearchText] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'Como criar um novo agendamento?',
      answer: 'Acesse a aba "Agenda" e clique no botão "+" para criar um novo agendamento. Selecione o cliente, serviço, profissional e data/hora desejada.',
    },
    {
      id: 2,
      question: 'Como gerenciar meus clientes?',
      answer: 'Vá para "Cadastros" > "Clientes". Aqui você pode visualizar, criar, editar e deletar clientes. Clique em um cliente para ver seu histórico completo.',
    },
    {
      id: 3,
      question: 'Como visualizar meus ganhos?',
      answer: 'Acesse "Financeiro" > "Painel" para ver um resumo dos seus ganhos. Para mais detalhes, vá em "Transações" ou "Relatórios".',
    },
    {
      id: 4,
      question: 'Como usar o WhatsApp Marketing?',
      answer: 'Em "Marketing" > "WhatsApp", você pode criar campanhas para seus clientes. Configure as mensagens e escolha os destinatários.',
    },
    {
      id: 5,
      question: 'Como resetar minha senha?',
      answer: 'Vá em "Perfil" > "Alterar Senha" e siga as instruções. Você receberá um email de confirmação.',
    },
    {
      id: 6,
      question: 'Como exportar meus dados?',
      answer: 'Em "Configurações" > "Exportar Dados", você pode baixar seus dados em formato CSV ou PDF.',
    },
  ];

  const contacts = [
    {
      id: 1,
      name: 'Email de Suporte',
      value: 'suporte@atendo.com',
      icon: 'mail',
      action: () => Linking.openURL('mailto:suporte@atendo.com'),
    },
    {
      id: 2,
      name: 'WhatsApp',
      value: '+55 11 99999-9999',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/5511999999999'),
    },
    {
      id: 3,
      name: 'Telefone',
      value: '(11) 3000-0000',
      icon: 'call',
      action: () => Linking.openURL('tel:1130000000'),
    },
    {
      id: 4,
      name: 'Website',
      value: 'www.atendo.com',
      icon: 'globe',
      action: () => Linking.openURL('https://www.atendo.com'),
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFaqItem = ({ item }) => (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() =>
        setExpandedFaq(expandedFaq === item.id ? null : item.id)
      }
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expandedFaq === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#0066cc"
        />
      </View>

      {expandedFaq === item.id && (
        <View style={styles.faqContent}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={item.action}
    >
      <View style={styles.contactIcon}>
        <Ionicons name={item.icon} size={24} color="#0066cc" />
      </View>

      <View style={styles.contactContent}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactValue}>{item.value}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar na FAQ..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
        <FlatList
          data={filteredFaqs}
          renderItem={renderFaqItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entre em Contato</Text>
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#0066cc" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Precisa de ajuda?</Text>
          <Text style={styles.infoText}>
            Consulte nossa documentação completa ou entre em contato com nosso time de suporte.
          </Text>
        </View>
      </View>

      {/* Feedback Button */}
      <TouchableOpacity style={styles.feedbackButton}>
        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        <Text style={styles.feedbackButtonText}>Enviar Feedback</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Atendo Mobile v5.4.3</Text>
        <Text style={styles.versionSubtext}>© 2024 Atendo. Todos os direitos reservados.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  faqContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#0066cc',
    lineHeight: 16,
  },
  feedbackButton: {
    backgroundColor: '#0066cc',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});

export default HelpScreen;
