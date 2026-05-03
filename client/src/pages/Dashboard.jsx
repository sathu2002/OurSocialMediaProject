import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "User";
  const userRole = localStorage.getItem("userRole") || "User";
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching dashboard tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-300 mt-2">
                Welcome, {userEmail} ({userRole})
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchTasks}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600">
            <p className="text-sm uppercase tracking-wide">Total Tasks</p>
            <h2 className="text-4xl font-bold mt-3">{totalTasks}</h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r from-amber-400 to-orange-500">
            <p className="text-sm uppercase tracking-wide">Pending</p>
            <h2 className="text-4xl font-bold mt-3">{pendingTasks}</h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r from-sky-500 to-cyan-500">
            <p className="text-sm uppercase tracking-wide">In Progress</p>
            <h2 className="text-4xl font-bold mt-3">{inProgressTasks}</h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-r from-emerald-500 to-pink-500">
            <p className="text-sm uppercase tracking-wide">Completed</p>
            <h2 className="text-4xl font-bold mt-3">{completedTasks}</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Tasks</h2>

            {tasks.length === 0 ? (
              <p className="text-slate-300">No tasks available.</p>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="bg-white/10 border border-white/10 rounded-2xl p-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold text-lg">
                        {task.title}
                      </h3>
                      <span className="text-slate-300 text-sm">
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 text-sm">
                      {task.description || "No description"}
                    </p>
                    <p className="text-slate-400 mt-2 text-sm">
                      Status: {task.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Link
              to="/tasks"
              className="block bg-white/10 backdrop-red-xl border border-white/10 rounded-3xl p-6 hover:bg-white/20 transition"
            >
              <h2 className="text-2xl font-bold text-white">Manage Tasks</h2>
              <p className="text-slate-300 mt-2">
                Create, edit and assign tasks easily.
              </p>
            </Link>

            <Link
              to="/calendar"
              className="block bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/20 transition"
            >
              <h2 className="text-2xl font-bold text-white">Calendar View</h2>
              <p className="text-slate-300 mt-2">
                View tasks by date and event name.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;