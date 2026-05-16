import { useEffect } from "react"
import {Route, Routes, Navigate} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux"
import {Toaster} from "react-hot-toast"
import {getMe} from "./features/auth/authSlice.js"
import ProtectedRoute from "./components/common/ProtectedRoute.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"

function App() {
  
  const dispatch = useDispatch()

  const {user, authChecked} = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(getMe())
  }, [dispatch])

  if(!authChecked){
    return(
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #27272a",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
