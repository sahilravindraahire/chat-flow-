import { useRef, useState } from "react";

function MessageInput({ onSend, loading }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() && !file) return;
    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (file) formData.append("media", file);
    onSend(formData);
    setText("");
    setFile(null);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return(
    <div className="p-4 border-t border-zinc-800 bg-[#111111]">
      {file && (
        <div className="flex items-center gap-2 mb-2 bg-zinc-900 px-3 py-2 rounded-lg text-sm text-zinc-300">
          <span className="truncate flex-1">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-400 text-xs">✕</button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="text-zinc-500 hover:text-indigo-400 transition p-2"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*,video/*,application/pdf,.doc,.docx,.zip"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:border-indigo-500 transition max-h-32 overflow-y-auto"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={loading || (!text.trim() && !file)}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
