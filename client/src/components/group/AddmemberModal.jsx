import { useState } from "react"
import {useDispatch, useSelector} from "react-redux"
import {addGroupMembers} from "../../features/group/groupSlice.js"
import Avatar from "../common/Avatar.jsx"
import OnlineBadge from "../common/OnlineBadge.jsx"

function AddmemberModal({onClose}) {

  const dispatch = useDispatch()
  const {users, onlineUsers} = useSelector((s) => s.auth)
  const {activeGroup} = useSelector((s) => s.group)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const existingMemberIds = activeGroup?.members?.map((m) => m._id) || [];
  const eligibleUsers = users.filter(
    (u) =>
      !existingMemberIds.includes(u._id) &&
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    await dispatch(addGroupMembers({ groupId: activeGroup._id, members: selected }));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Add Members</h2>
            <p className="text-zinc-500 text-xs mt-0.5">to {activeGroup?.groupName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">✕</button>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition mb-3"
        />

        {/* User list */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 mb-4">
          {eligibleUsers.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-6">
              {search ? "No users found" : "Everyone is already in this group"}
            </p>
          )}
          {eligibleUsers.map((u) => {
            const isChecked = selected.includes(u._id);
            const online = onlineUsers.includes(u._id);
            return (
              <label
                key={u._id}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition ${
                  isChecked ? "bg-indigo-600/15 border border-indigo-500/30" : "hover:bg-zinc-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(u._id)}
                  className="accent-indigo-500 shrink-0"
                />
                <Avatar src={u.profilePic} name={u.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-zinc-500 text-xs truncate">@{u.username}</p>
                </div>
                <OnlineBadge isOnline={online} />
              </label>
            );
          })}
        </div>

        {/* Selected count pill */}
        {selected.length > 0 && (
          <p className="text-xs text-indigo-400 text-center mb-3">
            {selected.length} person{selected.length > 1 ? "s" : ""} selected
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl py-2.5 text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || selected.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-2.5 text-sm font-medium transition"
          >
            {loading ? "Adding..." : `Add${selected.length > 0 ? ` (${selected.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddmemberModal

