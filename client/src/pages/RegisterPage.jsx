import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice.js";
import { Link } from "react-router-dom";

function RegisterPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    gender: "male",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      registerUser({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        gender: form.gender,
      }),
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Chat flow
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              name: "fullName",
              label: "Full Name",
              type: "text",
              placeholder: "John Doe",
            },
            {
              name: "username",
              label: "Username",
              type: "text",
              placeholder: "john_doe",
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "Min 8 characters",
            },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest block mb-1.5">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
