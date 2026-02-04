/**
 * Card Component - Componente de Card Reutilizável
 * Para exibição de informações em containers padronizados
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
  padding = 'medium',
  shadow = 'small',
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-2';
      case 'medium':
        return 'p-4';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getShadowStyles = () => {
    switch (shadow) {
      case 'none':
        return '';
      case 'small':
        return 'shadow-sm';
      case 'medium':
        return 'shadow-md';
      case 'large':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const baseStyles = `
    bg-white 
    rounded-2xl 
    border 
    border-gray-100
    ${getPaddingStyles()}
    ${getShadowStyles()}
    ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity 
        className={baseStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={baseStyles}>
      {children}
    </View>
  );
};

export default Card;
