import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket.js";
import { setOnlineUsers } from "../features/auth/authSlice.js";
import {
  appendIncomingMessage,
  appendIncomingGroupMessage,
  removeGroupMessage,
  removeMessage,
  fetchConversation,
} from "../features/message/messageSlice.js";
import {
  addGroupFromSocket,
  updateGroupFromSocket,
  removeGroupFromSocket,
} from "../features/group/groupSlice.js";

const useSocket = () => {
  const dispatch = useDispatch();
  const { activeChat } = useSelector((s) => s.message);
  const { activeGroup } = useSelector((s) => s.group);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("onlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("newMessage", (msg) => {
  if (
    activeChat?.type === "dm" &&
    (msg.senderId._id === activeChat.id ||
     msg.receiverId._id === activeChat.id)
  ) {
    dispatch(appendIncomingMessage(msg));
  }
  dispatch(fetchConversation());
});

    socket.on("messageDeleted", ({messageId}) => {
        dispatch(removeMessage(messageId))
    })

    socket.on("newGroupMessage", (msg) => {
  if (activeChat?.type === "group" && activeChat?.id === msg.groupId?._id?.toString()) {
    dispatch(appendIncomingGroupMessage(msg));
  }
});

    socket.on("groupMessageDeleted", ({messageId}) => {
        dispatch(removeGroupMessage(messageId))
    })

    socket.on("addedToGroup", (group) => {
        dispatch(addGroupFromSocket(group))
    })

    socket.on("groupUpdated", (group) => {
        dispatch(updateGroupFromSocket(group))
    })

    socket.on("removedFromGroup", ({groupId, groupName}) => {
        dispatch(removeGroupFromSocket({groupId}))
    })

    socket.on("groupDeleted", ({groupId}) => {
        dispatch(removeGroupFromSocket({groupId}))
    })

    return () => {
        socket.off("onlineUsers")
        socket.off("newMessage")
        socket.off("messageDeleted")
        socket.off("newGroupMessage")
        socket.off("groupMessageDeleted")
        socket.off("addedToGroup")
        socket.off("groupUpdated")
        socket.off("removedFromGroup")
        socket.off("groupDeleted")
    }
  }, [dispatch, activeChat, activeGroup]);
};

export default useSocket
