import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js";
import toast from "react-hot-toast";

// thunk

export const fetchConversation = createAsyncThunk(
  "message/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/message/conversation");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchMessage = createAsyncThunk(
  "message/fetchMessage",
  async ({ receiverId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/message/${receiverId}?page=${page}&limit=30`,
      );
      return { ...data.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async ({ receiverId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/message/send/${receiverId}`,
        formData,
        {
          //Required for file uploads.
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteMessage = createAsyncThunk(
  "message.deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markAsRead = createAsyncThunk(
  "message/markAsRead",
  async (senderId, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/message/read/${senderId}`);
      return senderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchGroupMessage = createAsyncThunk(
  "message/fetchGroupMessage",
  async ({ groupId, page = 1 }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `/message/group/${groupId}?page=${page}&limit=30`,
      );
      return { ...data.data, page, groupId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const sendGroupMessage = createAsyncThunk(
  "message/sendGroupMessage",
  async ({ groupId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/message/group/send/${groupId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteGroupMessage = createAsyncThunk(
  "message/deleteGroupMessage",
  async ({ groupId, messageId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/message/group/${groupId}/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// slice

const messageSlice = createSlice({
  name: "message",
  initialState: {
    conversations: [],
    messages: [],
    groupMessages: [],
    activeChat: null, // Currently opened chat
    pagination: null,
    loading: false,
  },
  reducers: {
    setActiveChat(state, action) {
      state.activeChat = action.payload;
      state.messages = [];
      state.groupMessages = [];
    },
    appendIncomingMessage(state, action) {
      state.messages.push(action.payload);
    },
    appendIncomingGroupMessage(state, action) {
      state.groupMessages.push(action.payload);
    },
    removeMessage(state, action) {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload,
      );
    },
    removeGroupMessage(state, action) {
      state.groupMessages = state.groupMessages.filter(
        (msg) => msg._id !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    // conversation
    builder.addCase(fetchConversation.fulfilled, (state, action) => {
      state.conversations = action.payload;
    });

    // dm msg
    builder.addCase(fetchMessage.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMessage.fulfilled, (state, action) => {
      state.loading = false;
      const { message = [], pagination, page } = action.payload;
      state.messages = page === 1 ? message : [...message, ...state.messages];
      state.pagination = pagination;
    });
    builder.addCase(fetchMessage.rejected, (state) => {
      state.loading = false;
    });

    // send dm
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload);
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      toast.error(action.payload || "message failed to send");
    });

    // delete dm
    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload,
      );
      toast.success("message deleted");
    });

    // group message
    builder.addCase(fetchGroupMessage.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGroupMessage.fulfilled, (state, action) => {
  state.loading = false;
  const { messages = [], pagination, page } = action.payload;
  state.groupMessages =
    page === 1 ? messages : [...messages, ...state.groupMessages];
  state.pagination = pagination;
});
    builder.addCase(fetchGroupMessage.rejected, (state) => {
      state.loading = false;
    });

    // send group message
    builder.addCase(sendGroupMessage.fulfilled, (state, action) => {
      state.groupMessages.push(action.payload);
    });
    builder.addCase(sendGroupMessage.rejected, (state, action) => {
      toast.error(action.payload || "failed to send");
    });

    // delete group message
    builder.addCase(deleteGroupMessage.fulfilled, (state, action) => {
      state.groupMessages = state.groupMessages.filter(
        (msg) => msg._id !== action.payload,
      );
      toast.success("message deleted");
    });
  },
});

export const {
  setActiveChat,
  appendIncomingMessage,
  appendIncomingGroupMessage,
  removeMessage,
  removeGroupMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
