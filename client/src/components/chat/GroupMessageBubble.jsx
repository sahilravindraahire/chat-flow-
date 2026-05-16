import {useDispatch, useSelector} from "react-redux"
import {deleteGroupMessage} from "../../features/message/messageSlice.js"

function GroupMessageBubble({msg}) {

    const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { activeGroup } = useSelector((s) => s.group);
 
  const isMine = msg.senderId?._id === user?._id;
  const isAdmin = activeGroup?.admin?._id === user?._id;
  const canDelete = isMine || isAdmin;
 
  const time = new Date(msg.createdAt).toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true   
})


  return (
    <div className={`flex gap-2 group ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {!isMine && (
        <img
          src={msg.senderId?.profilePic}
          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
          alt=""
        />
      )}
      <div className={`max-w-[65%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isMine && (
          <span className="text-[11px] text-indigo-400 font-medium px-1">
            {msg.senderId?.fullName}
          </span>
        )}
        {msg.mediaUrl && msg.messageType === "image" && (
          <img src={msg.mediaUrl} className="rounded-xl max-w-full max-h-64 object-cover border border-zinc-800" alt="media" />
        )}
        {msg.mediaUrl && msg.messageType === "video" && (
          <video src={msg.mediaUrl} controls className="rounded-xl max-w-full max-h-64 border border-zinc-800" />
        )}
        {msg.mediaUrl && msg.messageType === "file" && (
          <a href={msg.mediaUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300">
            <span>📎</span>
            <span className="truncate max-w-[160px]">{msg.fileName || "File"}</span>
          </a>
        )}
        {msg.text && (
          <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
            isMine ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-zinc-800 text-zinc-100 rounded-tl-sm"
          }`}>
            {msg.text}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">{time}</span>
          {canDelete && (
            <button
              onClick={() => dispatch(deleteGroupMessage({ groupId: activeGroup._id, messageId: msg._id }))}
              className="text-[10px] text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupMessageBubble

