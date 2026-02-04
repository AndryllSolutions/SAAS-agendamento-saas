/**
 * Navegação principal do app
 * React Navigation - Integração com backend FastAPI
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

// ===== Telas de Autenticação =====
import { LoginScreen, ForgotPasswordScreen, RegisterScreen } from '../screens';

// ===== Telas Principais (completas) =====
import { 
  HomeScreen, 
  AppointmentsScreen, 
  AppointmentDetailScreen,
  CreateAppointmentScreen,
  ClientsScreen,
  ClientDetailScreen,
  ServicesScreen,
  ProfileScreen,
} from '../screens';

// ===== Telas Placeholder (em desenvolvimento) =====
import {
  CalendarScreen,
  SettingsScreen,
  AdminDashboardScreen,
  UsersManagementScreen,
  CompanySettingsScreen,
  ProfessionalDashboardScreen,
  ScheduleScreen,
  ClientDashboardScreen,
  BookAppointmentScreen,
  MyAppointmentsScreen,
  ServiceDetailScreen,
  NotificationsScreen,
} from '../screens';

// Stack Navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação por Role
const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#6366f1',
        borderTopColor: '#4f46e5',
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#a5b4fc',
    }}
  >
    <Tab.Screen 
      name="AdminDashboard" 
      component={AdminDashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Appointments" 
      component={AppointmentsScreen}
      options={{
        title: 'Agendamentos',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Users" 
      component={UsersManagementScreen}
      options={{
        title: 'Usuários',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{
        title: 'Configurações',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
  </Tab.Navigator>
);

const ProfessionalNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#6366f1',
        borderTopColor: '#4f46e5',
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#a5b4fc',
    }}
  >
    <Tab.Screen 
      name="ProfessionalDashboard" 
      component={ProfessionalDashboardScreen}
      options={{
        title: 'Início',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Schedule" 
      component={ScheduleScreen}
      options={{
        title: 'Agenda',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Appointments" 
      component={AppointmentsScreen}
      options={{
        title: 'Atendimentos',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Clients" 
      component={ClientsScreen}
      options={{
        title: 'Clientes',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
  </Tab.Navigator>
);

const ClientNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#6366f1',
        borderTopColor: '#4f46e5',
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#a5b4fc',
    }}
  >
    <Tab.Screen 
      name="ClientDashboard" 
      component={ClientDashboardScreen}
      options={{
        title: 'Início',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="BookAppointment" 
      component={BookAppointmentScreen}
      options={{
        title: 'Agendar',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="MyAppointments" 
      component={MyAppointmentsScreen}
      options={{
        title: 'Meus Agendamentos',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
  </Tab.Navigator>
);

const StaffNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#6366f1',
        borderTopColor: '#4f46e5',
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#a5b4fc',
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        title: 'Início',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Appointments" 
      component={AppointmentsScreen}
      options={{
        title: 'Agendamentos',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Calendar" 
      component={CalendarScreen}
      options={{
        title: 'Calendário',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Clients" 
      component={ClientsScreen}
      options={{
        title: 'Clientes',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: () => null, // TODO: Adicionar ícone
      }}
    />
  </Tab.Navigator>
);

// Componente principal de navegação
const MainNavigator = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  // Retornar navegador baseado no role
  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminNavigator />;
    case UserRole.PROFESSIONAL:
      return <ProfessionalNavigator />;
    case UserRole.CLIENT:
      return <ClientNavigator />;
    case UserRole.STAFF:
      return <StaffNavigator />;
    default:
      return <StaffNavigator />;
  }
};

// Navegação de Autenticação
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// App Navigator Principal
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    // TODO: Adicionar tela de loading
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          
          {/* Telas modais/comuns */}
          <Stack.Screen 
            name="AppointmentDetail" 
            component={AppointmentDetailScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Detalhes do Agendamento',
            }}
          />
          <Stack.Screen 
            name="CreateAppointment" 
            component={CreateAppointmentScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Novo Agendamento',
            }}
          />
          <Stack.Screen 
            name="ClientDetail" 
            component={ClientDetailScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Detalhes do Cliente',
            }}
          />
          <Stack.Screen 
            name="ServiceDetail" 
            component={ServiceDetailScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Detalhes do Serviço',
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Notificações',
            }}
          />
          <Stack.Screen 
            name="CompanySettings" 
            component={CompanySettingsScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Configurações da Empresa',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
