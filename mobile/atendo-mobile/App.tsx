import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import CommandsScreen from './src/screens/CommandsScreen';
import PackagesScreen from './src/screens/PackagesScreen';
import FinancialScreen from './src/screens/FinancialScreen';
import ClientsScreen from './src/screens/ClientsScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ProfessionalsScreen from './src/screens/ProfessionalsScreen';
import WhatsAppMarketingScreen from './src/screens/WhatsAppMarketingScreen';
import PromotionsScreen from './src/screens/PromotionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para módulo Principal
function PrincipalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066cc' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Agendamentos' }}
      />
      <Stack.Screen 
        name="Commands" 
        component={CommandsScreen}
        options={{ title: 'Comandas' }}
      />
      <Stack.Screen 
        name="Packages" 
        component={PackagesScreen}
        options={{ title: 'Pacotes' }}
      />
    </Stack.Navigator>
  );
}

// Stack para módulo Financeiro
function FinancialStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066cc' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="FinancialScreen" 
        component={FinancialScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack para módulo Cadastros
function CadastrosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066cc' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ClientsScreen" 
        component={ClientsScreen}
        options={{ title: 'Clientes' }}
      />
      <Stack.Screen 
        name="ServicesScreen" 
        component={ServicesScreen}
        options={{ title: 'Serviços' }}
      />
      <Stack.Screen 
        name="ProfessionalsScreen" 
        component={ProfessionalsScreen}
        options={{ title: 'Profissionais' }}
      />
    </Stack.Navigator>
  );
}

// Stack para módulo Marketing
function MarketingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066cc' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="WhatsAppScreen" 
        component={WhatsAppMarketingScreen}
        options={{ title: 'WhatsApp' }}
      />
      <Stack.Screen 
        name="PromotionsScreen" 
        component={PromotionsScreen}
        options={{ title: 'Promoções' }}
      />
    </Stack.Navigator>
  );
}

// Navegação com abas
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-circle';
          
          if (route.name === 'PrincipalTab') {
            iconName = 'home';
          } else if (route.name === 'FinanceiroTab') {
            iconName = 'chart-line';
          } else if (route.name === 'CadastrosTab') {
            iconName = 'folder-multiple';
          } else if (route.name === 'MarketingTab') {
            iconName = 'bullhorn';
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog';
          }
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="PrincipalTab" 
        component={PrincipalStack}
        options={{ title: 'Principal' }}
      />
      <Tab.Screen 
        name="FinanceiroTab" 
        component={FinancialStack}
        options={{ title: 'Financeiro' }}
      />
      <Tab.Screen 
        name="CadastrosTab" 
        component={CadastrosStack}
        options={{ title: 'Cadastros' }}
      />
      <Tab.Screen 
        name="MarketingTab" 
        component={MarketingStack}
        options={{ title: 'Marketing' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
    </Tab.Navigator>
  );
}

// Componente principal do app
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Componente wrapper para passar a função de login
  const LoginScreenWrapper = (props: any) => (
    <LoginScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen 
            name="LoginStack" 
            component={LoginScreenWrapper}
            options={{ animationEnabled: false }}
          />
        ) : (
          <Stack.Screen 
            name="AppStack" 
            component={TabsNavigator}
            options={{ animationEnabled: false }}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
