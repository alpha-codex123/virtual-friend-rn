# Redux Toolkit Implementation

This project now uses Redux Toolkit for state management, specifically for authentication state.

## Structure

```
store/
├── index.ts          # Main store configuration
├── hooks.ts          # Typed hooks for Redux usage
├── Provider.tsx      # Redux provider with auth initialization
└── slices/
    └── authSlice.ts  # Authentication slice with thunks
```

## Features

### Authentication State Management
- **Login**: Async thunk that handles user login and token storage
- **Logout**: Async thunk that clears authentication state
- **Token Persistence**: Automatically restores authentication state on app start
- **Error Handling**: Centralized error management for auth operations

### Redux Store
- Configured with Redux Toolkit
- Includes middleware for handling async operations
- TypeScript support with typed hooks

### Navigation Integration
- Automatic navigation based on authentication state
- Protected routes redirect to login when not authenticated
- Authenticated users are redirected to main app

## Usage

### In Components

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, logoutUser } from '@/store/slices/authSlice';

// In your component
const dispatch = useAppDispatch();
const { isAuthenticated, isLoading, error, user } = useAppSelector((state) => state.auth);

// Login
const handleLogin = async (credentials) => {
  try {
    await dispatch(loginUser(credentials)).unwrap();
    // Navigation will happen automatically
  } catch (error) {
    // Error is handled by the slice
  }
};

// Logout
const handleLogout = async () => {
  try {
    await dispatch(logoutUser()).unwrap();
    // Navigation will happen automatically
  } catch (error) {
    // Error is handled by the slice
  }
};
```

### State Structure

```typescript
interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

## API Integration

The Redux implementation integrates with the existing API setup:
- Uses the configured `api` instance from `@/api/api`
- Automatically handles authentication headers
- Supports token refresh and error handling

## Navigation Flow

1. **App Start**: `persistToken` thunk runs to check for existing token
2. **Login**: User submits credentials → `loginUser` thunk → token stored → navigation to app
3. **Logout**: User clicks logout → `logoutUser` thunk → token cleared → navigation to auth
4. **Protected Routes**: Automatically check `isAuthenticated` state

## Migration from Context

The app has been migrated from React Context to Redux Toolkit:
- Removed `SessionContext` usage
- Updated all layouts to use Redux state
- Maintained the same API endpoints and functionality
- Added better error handling and loading states 