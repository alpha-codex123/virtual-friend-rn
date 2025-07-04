import api, { API_BASE_URL } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, isRejectedWithValue, PayloadAction } from "@reduxjs/toolkit";
import { Audio } from "expo-av";

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
export const preLoadAllAudios = async(messages:ChatMessage[])=>{
   try {
      const results = [];
      var index=1
      for (const item of messages) {
        try {
          const { sound, status } = await Audio.Sound.createAsync({
            uri: item.audioUrl.includes('files')
            ?  item.audioUrl
            : `${API_BASE_URL}${item.audioUrl}`,
          });
          console.log('index loaded', index)
          results.push({
            ...item,
            isLoaded: status.isLoaded
          });
          index=index++
        } catch (e) {
          results.push({
            ...item
          });
        }
      }
      return results;
    } catch (err) {
      return isRejectedWithValue(err);
    }
}
// Async thunks
export const uploadAudioMessage = createAsyncThunk(
  "chat/uploadAudio",
  async (uri: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      const fileUriParts = uri.split("/");
      const filename = fileUriParts[fileUriParts.length - 1];

      formData.append("file", {
        uri,
        name: filename,
        type: "audio/m4a",
      } as any);
      console.log("formData", formData, token);
      const response = await api.post("/Chat/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(
        "uploadAudioMessage response",
        response.data.find((item: any) => item.role == 1)
      );
      // await preLoadAllAudios(response.data)
      // dispatch(getAllMessages())
      return response.data;
    } catch (error: any) {
      console.log("uploadAudioMessage error", error, error.response?.data?.message, error?.response?.error);
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);
// Async thunks
export const getAllMessages = createAsyncThunk(
  "chat/getAllMessages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/Chat/messages", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("getAllMessages response", response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages = [...state.messages, action.payload];
    },
    addLoadingMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: action.payload,
        messageText: "",
        audioUrl: "",
        timestamp: new Date().toISOString(),
        role: 1,
        isLoading: true,
      });
    },
    updateMessage: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<ChatMessage> }>
    ) => {
      const index = state.messages.findIndex(
        (msg) => msg.id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...action.payload.updates,
        };
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(
        (msg) => msg.id !== action.payload
      );
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
        // state.messages.pop()
        // state.messages.push(action.payload);
        // state.messages = [...state.messages.slice(0,state.messages.length-1),state.messages.find((item:any)=>item.role===0)]
        state.messages = [
          ...state.messages.slice(0, -1), // remove the last item
          ...action.payload.filter((item: any) => item.role === 0), // add user message first
          ...action.payload.filter((item: any) => item.role === 1), // then system message
        ];
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
