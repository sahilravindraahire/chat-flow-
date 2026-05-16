import React from 'react'
import { useState } from 'react'
import {useDispatch, useSelector} from "react-redux"
import {loginUser} from "../features/auth/authSlice.js"
import {Link} from "react-router-dom"

function LoginPage() {

  const dispatch = useDispatch()

  const {loading} = useSelector((s) => s.auth)

  const [form, setForm] = useState({username: "", password: ""})

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value}) 

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(form))
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Chat Flow</h1>
          <p className="text-zinc-500 mt-2 text-sm">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="your_username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          No account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
