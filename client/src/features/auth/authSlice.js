import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "../../socket/socket.js";

// thunk

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/register", userData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/login", credentials);
      console.log(data);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "login failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/user/logout");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "logout failed");
    }
  },
);

export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/me");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        "/user/update-profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "profile update failed",
      );
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwords, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        "/user/change-password",
        passwords,
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "password change failed",
      );
    }
  },
);

// slice

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    users: [],
    onlineUsers: [],
    loading: false,
    authChecked: false,
  },
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    // register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
    state.loading = false
    state.user = action.payload
    connectSocket(action.payload._id)
    toast.success("Account created")
})
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      toast.error(action.payload);
    });

    // login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token); // ← save token
      connectSocket(action.payload.user._id);
      toast.success("Login successful");
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      toast.error(action.payload);
    });

    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
    state.user = null
    localStorage.removeItem("token")  // ← clear token
    disconnectSocket()
    toast.success("Logged out")
})

    // getMe
    builder.addCase(getMe.fulfilled, (state, action) => {
      if (!action.payload) {
        state.authChecked = true;
        return;
      }
      state.user = action.payload;
      state.authChecked = true;
      connectSocket(action.payload._id);
    });
    builder.addCase(getMe.rejected, (state) => {
      state.authChecked = true;
    });

    // getAllUsers
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });

    // updateProfile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      toast.success("profile updated");
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      toast.error(action.payload);
    });

    // changePassword
    builder.addCase(changePassword.fulfilled, () => {
      toast.success("password chnaged");
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      toast.error(action.payload);
    });
  },
});

export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
