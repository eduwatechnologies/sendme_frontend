import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../axios';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  errandId?: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: User;
  lastMessage: Message;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationMessages: Message[];
  activeConversationUser: User | null;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationMessages: [],
  activeConversationUser: null,
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
};

// Async Thunks

// Fetch all conversations
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

// Fetch messages with a specific user
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ recipientId, content, errandId }: { recipientId: string; content: string; errandId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/send', { recipientId, content, errandId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversationUser: (state, action) => {
      state.activeConversationUser = action.payload;
    },
    clearActiveConversation: (state) => {
      state.activeConversationMessages = [];
      state.activeConversationUser = null;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      const activeUser = state.activeConversationUser;

      // Check if the message is from the user we are currently chatting with
      // We assume if activeUser is set, we are on the chat page with that user
      const isActiveConversation = activeUser && (
        message.sender._id === activeUser._id || 
        message.recipient._id === activeUser._id
      );

      // Only add to active messages list if it belongs to the active conversation
      if (isActiveConversation) {
        state.activeConversationMessages.push(message);
      } else {
        // If not active conversation, increment unread count
        state.unreadCount += 1;
      }

      // Also update the conversation last message if it exists
      const conversationIndex = state.conversations.findIndex(
        c => c.user._id === message.recipient._id || c.user._id === message.sender._id
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload;
        // Move to top
        const conversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(conversation);
      } else {
         // If conversation doesn't exist in list (new chat), we might want to add it?
         // But we need the 'user' object for the conversation entry.
         // 'message.sender' or 'message.recipient' should have the user info.
         // If we received a message, the other user is the sender.
         // If we sent it (via socket echo?), the other user is recipient.
         // Typically addMessage is for incoming.
         // Safety check for sender
         const sender = message.sender;
         if (sender && activeUser && sender._id === activeUser._id) {
            // It's from the active user, but not in our list? weird.
         }
         // const otherUser = message.sender._id === activeUser?._id ? message.sender : message.sender; // Logic simplified for incoming
         
         // Only add if we have user details (which populate should give)
         // state.conversations.unshift({ user: otherUser, lastMessage: message });
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.conversations = action.payload;
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeConversationMessages = action.payload;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.isSending = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isSending = false;
      state.activeConversationMessages.push(action.payload);
      
      // Update or add to conversations list
      const otherUserId = action.payload.sender._id === state.activeConversationUser?._id 
        ? action.payload.sender._id 
        : action.payload.recipient._id;

      const conversationIndex = state.conversations.findIndex(c => c.user._id === otherUserId);
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload;
        // Move to top
        const conversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(conversation);
      } else if (state.activeConversationUser) {
        // New conversation started
        state.conversations.unshift({
          user: state.activeConversationUser,
          lastMessage: action.payload
        });
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isSending = false;
      state.error = action.payload as string;
    });
  },
});

export const { setActiveConversationUser, clearActiveConversation, addMessage, resetUnreadCount } = chatSlice.actions;
export default chatSlice.reducer;
