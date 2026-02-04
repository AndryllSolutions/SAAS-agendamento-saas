/**
 * Button Component - Componente de Botão Reutilizável
 * Baseado no design system do backend (cores, bordas, etc.)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-500';
      case 'secondary':
        return 'bg-green-500';
      case 'danger':
        return 'bg-red-500';
      case 'outline':
        return 'bg-transparent border-2 border-indigo-500';
      case 'ghost':
        return 'bg-transparent';
      default:
        return 'bg-indigo-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2';
      case 'medium':
        return 'px-4 py-3';
      case 'large':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextStyles = () => {
    const baseSize = size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base';
    
    switch (variant) {
      case 'outline':
        return `${baseSize} text-indigo-500 font-semibold`;
      case 'ghost':
        return `${baseSize} text-indigo-500 font-medium`;
      default:
        return `${baseSize} text-white font-bold`;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        ${getVariantStyles()} 
        ${getSizeStyles()} 
        ${fullWidth ? 'w-full' : ''} 
        rounded-xl 
        items-center 
        justify-center 
        flex-row
        ${isDisabled ? 'opacity-50' : 'active:opacity-80'}
      `}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#6366f1' : '#ffffff'} size="small" />
      ) : (
        <>
          {leftIcon && <Text className="mr-2 text-xl">{leftIcon}</Text>}
          <Text className={getTextStyles()}>{title}</Text>
          {rightIcon && <Text className="ml-2 text-xl">{rightIcon}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
