import { useEffect, useRef, useState } from "react"
import {useDispatch, useSelector} from "react-redux"
import {sendMessage, sendGroupMessage, markAsRead} from "../../features/message/messageSlice.js"
import MessageBubble from "../chat/MessageBubble.jsx"
import GroupMessageBubble from "../chat/GroupMessageBubble.jsx"
import MessageInput from "../chat/MessageInput.jsx"
import GroupInfoModel from "../group/GroupInfoModel.jsx"

function ChatWindow() {

  const dispatch = useDispatch()
  const {activeChat, messages, groupMessages, loading} = useSelector((s) => s.message)
  const {activeGroup} = useSelector((s) => s.group)
  const {onlineUsers} = useSelector((s) => s.auth)

  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const bottomRef = useRef(null);

  const isGroup = activeChat?.type === "group";
  const chatData = activeChat?.data;
  const displayMessages = isGroup ? groupMessages : messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  useEffect(() => {
    if (!isGroup && activeChat?.id) {
      dispatch(markAsRead(activeChat.id));
    }
  }, [activeChat, isGroup, dispatch]);

  const handleSend = (formData) => {
    if (isGroup) {
      dispatch(sendGroupMessage({ groupId: activeChat.id, formData }));
    } else {
      dispatch(sendMessage({ receiverId: activeChat.id, formData }));
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 bg-[#0d0d0d] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-zinc-500 text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const memberCount = Array.isArray(activeGroup?.members)
  ? activeGroup.members.length
  : Array.isArray(chatData?.members)
  ? chatData.members.length
  : 0;

  const headerName = isGroup ? chatData?.groupName : chatData?.fullName;
  const headerImage = isGroup ? chatData?.groupImage : chatData?.profilePic;
  const headerSub = isGroup
  ? `${memberCount} members`
  : onlineUsers.includes(activeChat.id)
  ? "Online"
  : chatData?.lastSeen
  ? `Last seen ${new Date(chatData.lastSeen).toLocaleString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
})}`
  : "Offline";

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d0d] min-w-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {headerImage ? (
            <img src={headerImage} className="w-9 h-9 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold">
              {headerName?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white text-sm font-medium">{headerName}</p>
            <p className={`text-xs ${headerSub === "Online" ? "text-emerald-400" : "text-zinc-500"}`}>
              {headerSub}
            </p>
          </div>
        </div>
        {isGroup && (
          <button
            onClick={() => setShowGroupInfo(true)}
            className="text-zinc-500 hover:text-indigo-400 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
 
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="text-center text-zinc-600 text-xs py-4">Loading messages...</div>
        )}
        {displayMessages.length === 0 && !loading && (
          <div className="text-center text-zinc-600 text-xs py-8">
            No messages yet. Say hello! 👋
          </div>
        )}
        {displayMessages.map((msg) =>
          isGroup ? (
            <GroupMessageBubble key={msg._id} msg={msg} />
          ) : (
            <MessageBubble key={msg._id} msg={msg} />
          )
        )}
        <div ref={bottomRef} />
      </div>
 
      {/* Input */}
      <MessageInput onSend={handleSend} loading={loading} />
 
      {showGroupInfo && isGroup && (
        <GroupInfoModel onClose={() => setShowGroupInfo(false)} />
      )}
    </div>
  )
}

export default ChatWindow
