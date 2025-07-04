# Button Component

A reusable button component with loading and disabled states, built for React Native.

## Features

- **Loading State**: Shows activity indicator when `loading` is true
- **Disabled State**: Disables interaction when `disabled` is true
- **Multiple Variants**: Primary, secondary, and danger styles
- **Size Options**: Small, medium, and large sizes
- **Customizable**: Accepts custom styles and text styles
- **TypeScript Support**: Fully typed with TypeScript

## Usage

```tsx
import Button from '@/components/ui/Button';

// Basic usage
<Button 
  title="Click me" 
  onPress={() => console.log('Pressed!')} 
/>

// With loading state
<Button 
  title="Submit" 
  onPress={handleSubmit}
  loading={isLoading}
  disabled={isLoading}
/>

// Different variants
<Button 
  title="Primary" 
  variant="primary" 
  onPress={handlePress} 
/>
<Button 
  title="Secondary" 
  variant="secondary" 
  onPress={handlePress} 
/>
<Button 
  title="Danger" 
  variant="danger" 
  onPress={handlePress} 
/>

// Different sizes
<Button 
  title="Small" 
  size="small" 
  onPress={handlePress} 
/>
<Button 
  title="Medium" 
  size="medium" 
  onPress={handlePress} 
/>
<Button 
  title="Large" 
  size="large" 
  onPress={handlePress} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Button text |
| `onPress` | `() => void` | - | Press handler |
| `loading` | `boolean` | `false` | Show loading indicator |
| `disabled` | `boolean` | `false` | Disable button |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `style` | `ViewStyle` | - | Custom button styles |
| `textStyle` | `TextStyle` | - | Custom text styles |

## Variants

- **Primary**: Blue background with white text
- **Secondary**: Transparent with blue border and text
- **Danger**: Red background with white text

## Sizes

- **Small**: 40px height, 14px font
- **Medium**: 50px height, 16px font  
- **Large**: 56px height, 18px font

## States

- **Normal**: Standard appearance
- **Loading**: Shows activity indicator, disables interaction
- **Disabled**: Grayed out, disables interaction
- **Active**: Slightly transparent when pressed (activeOpacity: 0.8) 