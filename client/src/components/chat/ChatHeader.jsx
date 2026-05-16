import { useState } from "react";
import { useSelector } from "react-redux";
import GroupInfoModel from "../group/GroupInfoModel";

function ChatHeader() {
  const { activeChat } = useSelector((s) => s.message);
  const { activeGroup } = useSelector((s) => s.group);
  const { onlineUsers } = useSelector((s) => s.auth);

  const [showGroupInfo, setShowGroupInfo] = useState(false);

  if (!activeChat) return null;

  const isGroup = activeChat.type === "group";
  const data = activeChat.data;

  const name = isGroup ? data?.groupName : data?.fullName;
  const image = isGroup ? data?.groupImage : data?.profilePic;

  const isOnline = !isGroup && onlineUsers.includes(activeChat.id);

  const subtitle = isGroup
    ? `${activeGroup?.members?.length || 0} members`
    : isOnline
    ? "Online"
    : data?.lastSeen
    ? `Last seen ${new Date(data.lastSeen).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Offline";

  return(
    <>
    <div className="px-4 py-3 border-b border-zinc-800 bg-[#111111] flex items-center justify-between shrink-0">
        {/* Left — avatar + name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold">
                {name?.[0]?.toUpperCase()}
              </div>
            )}
            {/* online dot for DMs */}
            {!isGroup && (
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111111] ${
                  isOnline ? "bg-emerald-400" : "bg-zinc-600"
                }`}
              />
            )}
          </div>
 
          <div>
            <p className="text-white text-sm font-medium leading-none">{name}</p>
            <p
              className={`text-xs mt-0.5 ${
                isOnline ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>
 
        {/* Right — actions */}
        <div className="flex items-center gap-2">
          {isGroup && (
            <>
              {/* Members count pill */}
              <span className="text-xs text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                {activeGroup?.members?.length || 0} members
              </span>
 
              {/* Info button */}
              <button
                onClick={() => setShowGroupInfo(true)}
                className="text-zinc-500 hover:text-indigo-400 transition p-1.5 rounded-lg hover:bg-zinc-900"
                title="Group info"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </>
          )}
 
          {/* DM — show online status badge */}
          {!isGroup && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full border ${
                isOnline
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-zinc-500 bg-zinc-900 border-zinc-800"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>
 
      {showGroupInfo && isGroup && (
        <GroupInfoModal onClose={() => setShowGroupInfo(false)} />
      )}
    </>
  );
}

export default ChatHeader;
