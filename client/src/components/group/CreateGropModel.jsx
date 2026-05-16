import { useState } from "react"
import {useDispatch, useSelector} from "react-redux"
import {createGroup} from "../../features/group/groupSlice.js"

function CreateGropModel({onClose}) {
  const dispatch = useDispatch()
  const {users} = useSelector((s) => s.auth)
  const [groupName, setGroupName] = useState("")
  const [selected, setSelected] = useState([])
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const toggleMember = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("groupName", groupName.trim());
    selected.forEach((id) => formData.append("members", id));
    if (image) formData.append("groupImage", image);
    await dispatch(createGroup(formData));
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-zinc-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Create Group</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">✕</button>
        </div>
 
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">Group Name</label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="e.g. Project Team"
            />
          </div>
 
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">Group Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-300 file:text-xs file:cursor-pointer"
            />
          </div>
 
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-2">Add Members</label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {users.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-900 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    className="accent-indigo-500"
                  />
                  <img src={u.profilePic} className="w-7 h-7 rounded-full object-cover" alt="" />
                  <span className="text-white text-sm">{u.fullName}</span>
                  <span className="text-zinc-500 text-xs">@{u.username}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
 
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white rounded-xl py-2.5 text-sm transition">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !groupName.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-2.5 text-sm font-medium transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateGropModel
