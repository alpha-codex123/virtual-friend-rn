import api from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Use the existing API instance
      const response = await api.post('User/login', credentials);
      const { token, user } = response.data as LoginResponse;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Logout started");
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('token');
      console.log("Logout successful");
      return null;
    } catch (error: any) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const persistToken = createAsyncThunk(
  'auth/persistToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Optionally validate token with backend
        // const response = await axios.get('/api/auth/validate', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // return { token, user: response.data.user };
        return { token, user: null }; // For now, just return token
      }
      return null;
    } catch (error: any) {
      return rejectWithValue('Token validation failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; firstName: string; lastName: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('User/register', data);
      // Optionally, you could return the token and user if your API does so
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errorMessage || 'Registration failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Persist token
    builder
      .addCase(persistToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(persistToken.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(persistToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Optionally, set user/token if your API returns them
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer; 