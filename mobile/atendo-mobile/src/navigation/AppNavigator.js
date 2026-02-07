import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens - Principal
import DashboardScreen from '../screens/DashboardScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import CommandsScreen from '../screens/CommandsScreen';
import PackagesScreen from '../screens/PackagesScreen';

// Screens - Financeiro
import FinancialScreen from '../screens/FinancialScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import CommissionsScreen from '../screens/CommissionsScreen';
import CashControlScreen from '../screens/CashControlScreen';
import ReportsScreen from '../screens/ReportsScreen';

// Screens - Cadastros
import ClientsScreen from '../screens/ClientsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfessionalsScreen from '../screens/ProfessionalsScreen';

// Screens - Marketing
import WhatsAppMarketingScreen from '../screens/WhatsAppMarketingScreen';
import PromotionsScreen from '../screens/PromotionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Principal Stack
const PrincipalStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="Appointments" component={AppointmentsScreen} />
    <Stack.Screen name="Commands" component={CommandsScreen} />
    <Stack.Screen name="Packages" component={PackagesScreen} />
  </Stack.Navigator>
);

// Financeiro Stack
const FinanceiroStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="FinancialHome" component={FinancialScreen} />
    <Stack.Screen name="Transactions" component={TransactionsScreen} />
    <Stack.Screen name="Commissions" component={CommissionsScreen} />
    <Stack.Screen name="CashControl" component={CashControlScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
  </Stack.Navigator>
);

// Cadastros Stack
const CadastrosStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ClientsHome" component={ClientsScreen} />
    <Stack.Screen name="Clients" component={ClientsScreen} />
    <Stack.Screen name="Services" component={ServicesScreen} />
    <Stack.Screen name="Professionals" component={ProfessionalsScreen} />
  </Stack.Navigator>
);

// Marketing Stack
const MarketingStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="WhatsAppMarketing" component={WhatsAppMarketingScreen} />
    <Stack.Screen name="Promotions" component={PromotionsScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'PrincipalTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'FinanceiroTab') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'CadastrosTab') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'MarketingTab') {
          iconName = focused ? 'megaphone' : 'megaphone-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen
      name="PrincipalTab"
      component={PrincipalStack}
      options={{
        tabBarLabel: 'Principal',
      }}
    />
    <Tab.Screen
      name="FinanceiroTab"
      component={FinanceiroStack}
      options={{
        tabBarLabel: 'Financeiro',
      }}
    />
    <Tab.Screen
      name="CadastrosTab"
      component={CadastrosStack}
      options={{
        tabBarLabel: 'Cadastros',
      }}
    />
    <Tab.Screen
      name="MarketingTab"
      component={MarketingStack}
      options={{
        tabBarLabel: 'Marketing',
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainApp"
        component={MainTabNavigator}
        options={{
          animationEnabled: false,
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
