import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {fetchConversation, setActiveChat, fetchMessage, fetchGroupMessage} from "../../features/message/messageSlice.js"
import {fetchMyGroups, setActiveGroup} from "../../features/group/groupSlice.js"
import {getAllUsers, logoutUser} from "../../features/auth/authSlice.js"
import CreateGropModel from "../group/CreateGropModel.jsx"

function Sidebar() {

  const dispatch = useDispatch()
  const {onlineUsers, users, user} = useSelector((s) => s.auth)
  const {conversations} = useSelector((s) => s.message)
  const {groups, activeGroup} = useSelector((s) => s.group)
  const { activeChat } = useSelector((s) => s.message);

  const [tab, setTab] = useState("dms")

  const [search, setSearch] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  useEffect(() => {
    dispatch(fetchConversation())
    dispatch(fetchMyGroups())
    dispatch(getAllUsers())
  }, [dispatch])

  const handleSelectDM = (userId, userData) => {
    dispatch(setActiveChat({ type: "dm", id: userId, data: userData }));
    dispatch(setActiveGroup(null));
    dispatch(fetchMessage({ receiverId: userId }));
  };

  const handleSelectGroup = (group) => {
    dispatch(setActiveGroup(group));
    dispatch(setActiveChat({ type: "group", id: group._id, data: group }));
    dispatch(fetchGroupMessage({ groupId: group._id }));
  };

  const isOnline = (id) => onlineUsers.includes(id?.toString());

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConversations = conversations.filter((c) =>
    c.user?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="w-80 h-screen bg-[#111111] border-r border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.profilePic}
                alt={user?.fullName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111111]" />
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">{user?.fullName}</p>
              <p className="text-zinc-500 text-xs mt-0.5">@{user?.username}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(logoutUser())}
            className="text-zinc-500 hover:text-red-400 transition text-xs"
          >
            Logout
          </button>
        </div>
 
        {/* Search */}
        <div className="px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
 
        {/* Tabs */}
        <div className="flex px-4 gap-1 mb-2">
          {["dms", "groups", "users"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition capitalize ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t === "dms" ? "Chats" : t === "groups" ? "Groups" : "People"}
            </button>
          ))}
        </div>
 
        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {/* DMs */}
          {tab === "dms" && (
            <div className="space-y-0.5">
              {filteredConversations.length === 0 && (
                <p className="text-zinc-600 text-xs text-center py-8">No conversations yet</p>
              )}
              {filteredConversations.map((conv) => {
                const active = activeChat?.type === "dm" && activeChat.id === conv._id?.toString();
                const online = isOnline(conv._id);
                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectDM(conv._id, conv.user)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      active ? "bg-indigo-600/20 border border-indigo-500/30" : "hover:bg-zinc-900"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={conv.user?.profilePic} className="w-9 h-9 rounded-full object-cover" alt="" />
                      {online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111111]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-white text-sm font-medium truncate">{conv.user?.fullName}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-indigo-500 text-white text-[10px] rounded-full px-1.5 py-0.5 ml-1 shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs truncate">
                        {conv.lastMessage?.text || (conv.lastMessage?.mediaUrl ? "📎 Media" : "")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
 
          {/* Groups */}
          {tab === "groups" && (
            <>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="w-full text-xs text-indigo-400 hover:text-indigo-300 border border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl py-2.5 mb-3 transition"
              >
                + New Group
              </button>
              <div className="space-y-0.5">
                {filteredGroups.map((group) => {
                  const active = activeGroup?._id === group._id;
                  return (
                    <button
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                        active ? "bg-indigo-600/20 border border-indigo-500/30" : "hover:bg-zinc-900"
                      }`}
                    >
                      {group.groupImage ? (
                        <img src={group.groupImage} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {group.groupName[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{group.groupName}</p>
                        <p className="text-zinc-500 text-xs">{group.members?.length} members</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
 
          {/* All Users */}
          {tab === "users" && (
            <div className="space-y-0.5">
              {filteredUsers.map((u) => {
                const online = isOnline(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => handleSelectDM(u._id, u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-zinc-900 transition"
                  >
                    <div className="relative shrink-0">
                      <img src={u.profilePic} className="w-9 h-9 rounded-full object-cover" alt="" />
                      {online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#111111]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{u.fullName}</p>
                      <p className="text-zinc-500 text-xs">@{u.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
 
      {showCreateGroup && <CreateGropModel onClose={() => setShowCreateGroup(false)} />}
    </>
  )
}

export default Sidebar
