/**
 * Exportação de todas as telas do app
 * Telas criadas baseadas nos models/schemas/endpoints do backend
 */

import React from 'react';
import { View, Text } from 'react-native';

// Tela em branco placeholder para telas não implementadas
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View className="flex-1 bg-gray-50 items-center justify-center">
    <Text className="text-4xl mb-4">🚧</Text>
    <Text className="text-gray-500 text-lg">{title}</Text>
    <Text className="text-gray-400 text-sm mt-2">Em desenvolvimento</Text>
  </View>
);

// ===== AUTH SCREENS =====
export { default as LoginScreen } from './auth/LoginScreen';
export const ForgotPasswordScreen = () => <PlaceholderScreen title="Recuperar Senha" />;
export const RegisterScreen = () => <PlaceholderScreen title="Criar Conta" />;

// ===== HOME SCREENS =====
export { default as HomeScreen } from './home/HomeScreen';

// ===== APPOINTMENTS SCREENS =====
export { default as AppointmentsScreen } from './appointments/AppointmentsScreen';
export { default as AppointmentDetailScreen } from './appointments/AppointmentDetailScreen';
export { default as CreateAppointmentScreen } from './appointments/CreateAppointmentScreen';

// ===== CLIENTS SCREENS =====
export { default as ClientsScreen } from './clients/ClientsScreen';
export { default as ClientDetailScreen } from './clients/ClientDetailScreen';

// ===== SERVICES SCREENS =====
export { default as ServicesScreen } from './services/ServicesScreen';
export { default as ServiceDetailScreen } from './services/ServiceDetailScreen';
export { default as CreateServiceScreen } from './services/CreateServiceScreen';

// ===== PROFILE SCREENS =====
export { default as ProfileScreen } from './profile/ProfileScreen';
export { default as SettingsScreen } from './settings/SettingsScreen';

// ===== OTHER SCREENS =====
export { default as CalendarScreen } from './calendar/CalendarScreen';
export { default as NotificationsScreen } from './notifications/NotificationsScreen';
export { default as CreateClientScreen } from './clients/CreateClientScreen';

// ===== FINANCIAL SCREENS =====
export { default as FinancialDashboardScreen } from './financial/FinancialDashboardScreen';
export { default as CashRegistersScreen } from './financial/CashRegistersScreen';
export { default as TransactionsScreen } from './financial/TransactionsScreen';
export { default as AccountsScreen } from './financial/AccountsScreen';
export { default as CategoriesScreen } from './financial/CategoriesScreen';
export const UsersManagementScreen = () => <PlaceholderScreen title="Gerenciar Usuários" />;
export const CompanySettingsScreen = () => <PlaceholderScreen title="Config. da Empresa" />;

// Professional Screens
export const ProfessionalDashboardScreen = () => <PlaceholderScreen title="Dashboard Profissional" />;
export const ScheduleScreen = () => <PlaceholderScreen title="Minha Agenda" />;

// Client Screens
export const ClientDashboardScreen = () => <PlaceholderScreen title="Dashboard Cliente" />;
export const BookAppointmentScreen = () => <PlaceholderScreen title="Agendar Horário" />;
export const MyAppointmentsScreen = () => <PlaceholderScreen title="Meus Agendamentos" />;

export default PlaceholderScreen;
