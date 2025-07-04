import api from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ChatMessage {
  id: string;
  messageText: string;
  audioUrl: string;
  timestamp: string;
  role: 0 | 1;
  isLoading?: boolean;
  error?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isRecording: boolean;
  recordingDuration: number;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isRecording: false,
  recordingDuration: 0,
};

// Async thunks
export const uploadAudioMessage = createAsyncThunk(
  'chat/uploadAudio',
  async (uri: string, { rejectWithValue,getState, dispatch }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      const fileUriParts = uri.split("/");
      const filename = fileUriParts[fileUriParts.length - 1];
      
      formData.append("file", {
        uri,
        name: filename,
        type: "audio/m4a",
      } as any);
      console.log("formData", formData,token);
      const response = await api.post('/Chat/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log("uploadAudioMessage response", response.data.find((item:any)=>item.role==1));
      // dispatch(getAllMessages())
      return  response.data.find((item:any)=>item.role==1);
    } catch (error: any) {
      console.log("uploadAudioMessage error", error);
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);
// Async thunks
export const getAllMessages = createAsyncThunk(
  'chat/getAllMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/Chat/messages', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("getAllMessages response", response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages = [...state.messages, action.payload];
    },
    addLoadingMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: action.payload,
        messageText: '',
        audioUrl: '',
        timestamp: new Date().toISOString(),
        role: 1,
        isLoading: true,
      });
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<ChatMessage> }>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload.updates };
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setRecordingDuration: (state, action: PayloadAction<number>) => {
      state.recordingDuration = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMessages.pending, (state) => {
        state.isLoading = state.messages.length === 0;
        state.error = null;
      })
      .addCase(getAllMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(getAllMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadAudioMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAudioMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push(action.payload);
        // You can update the message with the response data if needed
        // For example, if the API returns a transcription or AI response
      })
      .addCase(uploadAudioMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addMessage,
  addLoadingMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  setRecording,
  setRecordingDuration,
  clearError,

} = chatSlice.actions;

export default chatSlice.reducer; 