import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  removeGroupMember,
  leaveGroup,
  deleteGroup,
  transferAdmin,
  addGroupMembers,
} from "../../features/group/groupSlice.js"
import { setActiveChat } from "../../features/message/messageSlice.js"

function GroupInfoModel({ onClose }) {

  const dispatch = useDispatch()
  const { activeGroup } = useSelector((s) => s.group)
  const { user, users } = useSelector((s) => s.auth)
  const [tab, setTab] = useState("members")
  const [newAdminId, setNewAdminId] = useState("")
  const [addIds, setAddIds] = useState([])
  const [search, setSearch] = useState("")

  const isAdmin = activeGroup?.admin?._id === user?._id

  // IDs of current members (as strings for reliable comparison)
  const memberIds = activeGroup?.members?.map((m) => m._id.toString()) || []

  // Users not already in the group
  const nonMembers = users.filter(
    (u) =>
      !memberIds.includes(u._id.toString()) &&
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()))
  )

  const handleRemove = (memberId) => {
    dispatch(removeGroupMember({ groupId: activeGroup._id, memberId }))
  }

  const handleLeave = () => {
    dispatch(leaveGroup(activeGroup._id))
    dispatch(setActiveChat(null))
    onClose()
  }

  const handleDelete = () => {
    dispatch(deleteGroup(activeGroup._id))
    dispatch(setActiveChat(null))
    onClose()
  }

  const handleTransfer = () => {
  if (newAdminId) dispatch(transferAdmin({ groupId: activeGroup._id, newAdminId })); 
};

  const toggleAdd = (id) => {
    setAddIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleAddMembers = () => {
    if (addIds.length === 0) return
    dispatch(addGroupMembers({ groupId: activeGroup._id, members: addIds }))
    setAddIds([])
  }

  const tabs = ["members", ...(isAdmin ? ["add", "settings"] : [])]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl w-full max-w-md p-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {activeGroup?.groupImage ? (
              <img
                src={activeGroup.groupImage}
                className="w-10 h-10 rounded-full object-cover"
                alt=""
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold">
                {activeGroup?.groupName?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{activeGroup?.groupName}</p>
              <p className="text-zinc-500 text-xs">
                {activeGroup?.members?.length} members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Members tab ── */}
          {tab === "members" && (
            <div className="space-y-1">
              {activeGroup?.members?.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-900 transition"
                >
                  <img
                    src={m.profilePic}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {m.fullName}
                    </p>
                    <p className="text-zinc-500 text-xs">@{m.username}</p>
                  </div>

                  {/* Admin badge */}
                  {activeGroup?.admin?._id === m._id && (
                    <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}

                  {/* Remove button — only admin can remove, can't remove self or admin */}
                  {isAdmin &&
                    m._id !== user?._id &&
                    activeGroup?.admin?._id !== m._id && (
                      <button
                        onClick={() => handleRemove(m._id)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition shrink-0"
                      >
                        Remove
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* ── Add members tab ── */}
          {tab === "add" && isAdmin && (
            <div className="flex flex-col gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition"
              />

              <div className="space-y-1 max-h-52 overflow-y-auto">
                {nonMembers.length === 0 && (
                  <p className="text-zinc-600 text-xs text-center py-4">
                    {search ? "No users found" : "Everyone is already in this group"}
                  </p>
                )}
                {nonMembers.map((u) => (
                  <label
                    key={u._id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition ${
                      addIds.includes(u._id)
                        ? "bg-indigo-600/15 border border-indigo-500/30"
                        : "hover:bg-zinc-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={addIds.includes(u._id)}
                      onChange={() => toggleAdd(u._id)}
                      className="accent-indigo-500 shrink-0"
                    />
                    <img
                      src={u.profilePic}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{u.fullName}</p>
                      <p className="text-zinc-500 text-xs">@{u.username}</p>
                    </div>
                  </label>
                ))}
              </div>

              {addIds.length > 0 && (
                <p className="text-xs text-indigo-400 text-center">
                  {addIds.length} person{addIds.length > 1 ? "s" : ""} selected
                </p>
              )}

              <button
                onClick={handleAddMembers}
                disabled={addIds.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-medium transition"
              >
                Add {addIds.length > 0 ? `(${addIds.length})` : ""} Members
              </button>
            </div>
          )}

          {/* ── Settings tab ── */}
          {tab === "settings" && isAdmin && (
            <div className="space-y-4">

              {/* Transfer Admin */}
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">
                  Transfer Admin
                </p>
                <select
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition mb-2"
                >
                  <option value="">Select member...</option>
                  {activeGroup?.members
                    ?.filter((m) => m._id !== user?._id)
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.fullName}
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleTransfer}
                  disabled={!newAdminId}
                  className="w-full border border-indigo-500 text-indigo-400 hover:bg-indigo-600 hover:text-white disabled:opacity-40 py-2 rounded-xl text-sm transition"
                >
                  Transfer Admin
                </button>
              </div>

              <hr className="border-zinc-800" />

              {/* Delete group */}
              <button
                onClick={handleDelete}
                className="w-full bg-red-600/20 hover:bg-red-600 border border-red-800 text-red-400 hover:text-white py-2 rounded-xl text-sm transition"
              >
                Delete Group
              </button>
            </div>
          )}
        </div>

        {/* Leave group — non-admin only */}
        {!isAdmin && (
          <button
            onClick={handleLeave}
            className="mt-4 w-full border border-red-800 text-red-400 hover:bg-red-600/20 py-2 rounded-xl text-sm transition"
          >
            Leave Group
          </button>
        )}
      </div>
    </div>
  )
}

export default GroupInfoModel
