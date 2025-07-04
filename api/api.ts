import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


export const API_BASE_URL = 'https://502c-122-170-99-65.ngrok-free.app';

// Simulate getting token from storage or redux
async function getAuthToken(): Promise<string | null> {
  // For now, we'll still use AsyncStorage since the interceptor runs before Redux is available
  // In a more advanced setup, you could pass the store instance here
  const token = await AsyncStorage.getItem('token');
  console.log('getAuthToken token---', token)
  return token
}

// Optionally refresh token logic
async function refreshToken(): Promise<string | null> {
  // Your refresh token API call logic here
  // Return new access token or null on failure
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      // refreshToken: ...
    });
    return response.data.accessToken;
  } catch (error) {
    return null;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});


api.interceptors.request.use(
  async(config: InternalAxiosRequestConfig) => {
    console.log('config=--==-',config)
    // Initialize headers if undefined — create new AxiosHeaders
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    const token = await getAuthToken();
    if (token) {
      // Use the 'set' method of AxiosHeaders
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.log('request error==', error)
    return Promise.reject(error);
  }
);


// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest:any = error.config;

    // Example: handle 401 errors (token expired)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry // prevent infinite loop
    ) {
      originalRequest._retry = true;

      const newToken = await refreshToken();
      if (newToken) {
        // Update token in storage here (not shown)
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default api;