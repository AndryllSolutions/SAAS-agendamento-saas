/**
 * Componente principal do app
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';

// Ignorar warnings específicos do React Native
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
]);

// Tema do app (baseado nas configurações do backend)
const theme = {
  colors: {
    primary: '#6366f1', // Cor do sidebar do backend
    secondary: '#4f46e5',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    placeholder: '#94a3b8',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  roundness: 8,
};

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
          />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
