import React from 'react'
import Sidebar from '../components/layout/Sidebar.jsx'
import ChatWindow from '../components/layout/ChatWindow.jsx'
import useSocket from '../hooks/useSocket.js'

function ChatPage() {

    useSocket()

  return (
    <div className='flex h-screen overflow-hidden bg-[#0d0d0d]'>
      <Sidebar/>
      <ChatWindow/>
    </div>
  )
}

export default ChatPage
