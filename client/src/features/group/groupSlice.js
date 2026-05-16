import {
  createSlice,
  createAsyncThunk
} from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance.js";
import toast, { Toaster } from "react-hot-toast";

// thunk

export const fetchMyGroups = createAsyncThunk(
  "group/fetchMyGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/group/my-groups");
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchGroupsById = createAsyncThunk(
  "group/fetchGroupById",
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/group/${groupId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createGroup = createAsyncThunk(
  "group/createGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/group/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "failed to create group",
      );
    }
  },
);

export const updateGroup = createAsyncThunk(
  "group/updateGroup",
  async ({ groupId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/group/update/${groupId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "group update failed",
      );
    }
  },
);

export const addGroupMembers = createAsyncThunk(
  "group/addmembers",
  async ({ groupId, members }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/group/add-members/${groupId}`,
        { members },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const removeGroupMember = createAsyncThunk(
  "group/removeMember",
  async ({ groupId, memberId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(
        `/group/remove-member/${groupId}/${memberId}`,
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const leaveGroup = createAsyncThunk(
  "group/leave",
  async (groupId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/group/leave/${groupId}`);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const transferAdmin = createAsyncThunk(
  "group/transferAdmin",
  async ({ groupId, newAdminId }, { rejectWithValue }) => {  // ✅ rename param
    try {
      const { data } = await axiosInstance.patch(
        `/group/transfer-admin/${groupId}`,
        { newAdminId },  // ✅ matches backend
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteGroup = createAsyncThunk(
  "group/deleteGroup",
  async (groupId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/group/delete/${groupId}`);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// slice

const groupSlice = createSlice({
  name: "group",
  initialState: {
    groups: [],
    activeGroup: null,
    loading: false,
  },
  reducers: {
    setActiveGroup(state, action) {
      state.activeGroup = action.payload;
    },
    addGroupFromSocket(state, action) {
      const exists = state.groups.find((grp) => grp._id === action.payload._id);
      if (!exists) state.groups.unshift(action.payload);  // Adds new group at beginning
    },
    updateGroupFromSocket(state, action) {
        const idx = state.groups.findIndex((grp) => grp._id === action.payload._id)
        if(idx !== -1) state.groups[idx] = action.payload // Ensures group exists ==> Replaces updated group 
        if(state.activeGroup?._id === action.payload._id){
            state.activeGroup = action.payload
        } // Checks if current opened group is same ==> Updates currently opened group instantly
    },
    removeGroupFromSocket(state, action){
        state.groups = state.groups.filter((grp) => grp._id !== action.payload.groupId)
        if(state.activeGroup?._id === action.payload.groupId){
            state.activeGroup = null
        }  // If currently opened group got deleted ==> Close group UI
    }
  },
  extraReducers: (builder) => {
    // fetchMyGroups
    builder.addCase(fetchMyGroups.pending, (state) => {state.loading = true})
    builder.addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload
    })
    builder.addCase(fetchMyGroups.rejected, (state) => {
        state.loading = false
    })

    // fetchGroupById
    builder.addCase(fetchGroupsById.fulfilled, (state, action) => {
        state.activeGroup = action.payload
    })

    // createGroup
    builder.addCase(createGroup.fulfilled, (state, action) => {
        state.groups.unshift(action.payload)
        toast.success("group created")
    })
    builder.addCase(createGroup.rejected, (state, action) => {
        toast.error(action.payload)
    })

    // updateGroup
    builder.addCase(updateGroup.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((grp) => grp._id === action.payload._id)
        if(idx !== -1) state.groups[idx] = action.payload
        state.activeGroup = action.payload
        toast.success("group updated")
    })
    builder.addCase(updateGroup.rejected, (state, action) => {
        toast.error(action.payload)
    })

    // addMember
    builder.addCase(addGroupMembers.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((grp) => grp._id === action.payload._id)
        if(idx !== -1) state.groups[idx] = action.payload
        state.activeGroup = action.payload
        toast.success("member added")
    })
    builder.addCase(addGroupMembers.rejected, (state, action) => {
        toast.error(action.payload)
    })

    // removeMember
    builder.addCase(removeGroupMember.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((grp) => grp._id === action.payload._id)
        if(idx !== -1) state.groups[idx] = action.payload
        state.activeGroup = action.payload
        toast.success("member removed")
    })
    builder.addCase(removeGroupMember.rejected, (state, action) => {
        toast.error(action.payload)
    })

    // leaveGroup
    builder.addCase(leaveGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((grp) => grp._id !== action.payload)
        if(state.activeGroup?._id === action.payload) state.activeGroup = null
        toast.success("left the group")
    })
    builder.addCase(leaveGroup.rejected, (state, action) => {
        toast.error(action.payload)
    })

    // transferAdmin
    builder.addCase(transferAdmin.fulfilled, (state, action) => {
        const idx = state.groups.findIndex((grp) => grp._id === action.payload._id)
        if(idx !== -1) state.groups[idx] = action.payload
        state.activeGroup = action.payload
        toast.success("admin transfer")
    })
    builder.addCase(transferAdmin.rejected, (state, action) => {
        toast.error(action.payload)
    })

    //deleteGroup
    builder.addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((grp) => grp._id !== action.payload)
        if(state.activeGroup?._id === action.payload) state.activeGroup = null
        toast.success("group deleted")
    })
    builder.addCase(deleteGroup.rejected, (state, action) => {
        toast.error(action.payload)
    })
}
});

export const {
    setActiveGroup,
    addGroupFromSocket,
    updateGroupFromSocket,
    removeGroupFromSocket
} = groupSlice.actions

export default groupSlice.reducer
