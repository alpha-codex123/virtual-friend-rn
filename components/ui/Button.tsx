import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [styles.button, styles[size], styles[variant]];
    
    if (isDisabled) {
      baseStyle.push(styles.disabled);
    }
    
    return Object.assign({}, ...baseStyle);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.text, styles[`${size}Text`], styles[`${variant}Text`]];
    
    if (isDisabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return Object.assign({}, ...baseStyle);
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : '#87CEEB'} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  
  // Size variants
  small: {
    height: 40,
    paddingHorizontal: 16,
  },
  medium: {
    height: 50,
    paddingHorizontal: 20,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
  },
  
  // Color variants
  primary: {
    backgroundColor: '#87CEEB',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#87CEEB',
  },
  danger: {
    backgroundColor: '#ff4444',
  },
  
  // Disabled state
  disabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
    shadowOpacity: 0.1,
  },
  
  // Text styles
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#87CEEB',
  },
  dangerText: {
    color: '#fff',
  },
  
  disabledText: {
    color: '#999',
  },
});

export default Button; 