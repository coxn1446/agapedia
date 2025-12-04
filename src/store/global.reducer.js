import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  notifications: [],
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const { setLoading, addNotification, removeNotification } = globalSlice.actions;
export default globalSlice.reducer;

