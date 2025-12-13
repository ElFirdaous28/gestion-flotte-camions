import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    accessToken: null,
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, setAccessToken, setLoading, logoutUser } = userSlice.actions;
export default userSlice.reducer;
