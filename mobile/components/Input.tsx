/**
 * Input Component - Componente de Input Reutilizável
 * Baseado nos schemas do backend (validações, tipos, etc.)
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  suffix?: string;
  prefix?: string;
  onClear?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  error,
  disabled = false,
  required = false,
  suffix,
  prefix,
  onClear,
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-2">
          {label} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}
      
      <View 
        className={`
          flex-row items-center 
          border rounded-xl 
          bg-white
          ${error ? 'border-red-400' : 'border-gray-200'}
          ${disabled ? 'bg-gray-100' : ''}
          ${multiline ? 'items-start' : 'items-center'}
        `}
      >
        {prefix && (
          <Text className="text-gray-500 pl-3 font-medium">{prefix}</Text>
        )}
        
        <TextInput
          className={`
            flex-1 
            p-3 
            text-gray-900
            ${multiline ? 'h-24 text-start' : ''}
          `}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
        />
        
        {suffix && (
          <Text className="text-gray-500 pr-3">{suffix}</Text>
        )}
        
        {onClear && value.length > 0 && !disabled && (
          <TouchableOpacity 
            onPress={onClear}
            className="pr-3"
          >
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};

export default Input;
