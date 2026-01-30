import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../axios';

interface Errand {
  _id: string;
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  price: number;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  runner?: any;
  user?: any;
  trackingId?: string;
  createdAt: string;
}

interface ErrandState {
  errands: Errand[];
  activeErrandRequest: Errand | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ErrandState = {
  errands: [],
  activeErrandRequest: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchErrands = createAsyncThunk(
  'errands/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/errands');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch errands');
    }
  }
);

export const fetchErrandById = createAsyncThunk(
  'errands/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/errands/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch errand');
    }
  }
);

export const createErrand = createAsyncThunk(
  'errands/create',
  async (errandData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/errands', errandData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create errand');
    }
  }
);

export const updateErrandStatus = createAsyncThunk(
  'errands/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/errands/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const fetchErrandsBetweenUsers = createAsyncThunk(
  'errands/fetchBetweenUsers',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/errands/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch errands');
    }
  }
);

const errandSlice = createSlice({
  name: 'errands',
  initialState,
  reducers: {
    clearActiveErrandRequest: (state) => {
        state.activeErrandRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Errands
      .addCase(fetchErrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchErrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.errands = action.payload;
      })
      .addCase(fetchErrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Errands Between Users
      .addCase(fetchErrandsBetweenUsers.fulfilled, (state, action) => {
        // Find if there is any 'Accepted' errand waiting for confirmation
        // or 'In Progress' errand
        const relevantErrand = action.payload.find((e: Errand) => 
            e.status === 'Accepted' || e.status === 'In Progress'

        );
        state.activeErrandRequest = relevantErrand || null;
      })
      // Fetch Errand By Id (update if exists, push if not)
      .addCase(fetchErrandById.fulfilled, (state, action) => {
        const index = state.errands.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.errands[index] = action.payload;
        } else {
          state.errands.push(action.payload);
        }
      })
      // Create Errand
      .addCase(createErrand.fulfilled, (state, action) => {
        state.errands.unshift(action.payload);
      })
      // Update Status
      .addCase(updateErrandStatus.fulfilled, (state, action) => {
        const index = state.errands.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) {
          state.errands[index] = action.payload;
        }
        // Update active request if matches
        if (state.activeErrandRequest && state.activeErrandRequest._id === action.payload._id) {
            state.activeErrandRequest = action.payload;
        }
      });
  },
});

export const { clearActiveErrandRequest } = errandSlice.actions;
export default errandSlice.reducer;
