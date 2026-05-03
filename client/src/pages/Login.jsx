import { useState } from "react";

function Login() {
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (formData.email.trim() && formData.password.trim()) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userRole", selectedRole);
      window.location.href = "/dashboard";
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2">TaskFlow</h1>
        <p className="text-slate-300 mb-6">
          Social Media Agency Task Management
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole("Admin")}
            className={`py-3 rounded-xl font-semibold transition ${
              selectedRole === "Admin"
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-slate-300"
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("Staff")}
            className={`py-3 rounded-xl font-semibold transition ${
              selectedRole === "Staff"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-slate-300"
            }`}
          >
            Staff
          </button>
           <button
            type="button"
            onClick={() => setSelectedRole("Client")}
            className={`py-3 rounded-xl font-semibold transition ${
              selectedRole === "Client"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-slate-300"
            }`}
          >
            Client
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder={`${selectedRole} Email`}
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 p-3 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder={`${selectedRole} Password`}
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 p-3 outline-none"
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              selectedRole === "Admin"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            Login as {selectedRole}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;