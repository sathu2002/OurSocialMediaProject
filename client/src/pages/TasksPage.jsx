import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "Pending",
    priority: "Medium",
    dueDate: "",
    dueTime: "",
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = "Assigned person is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!formData.dueTime) {
      newErrors.dueTime = "Due time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/tasks/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/tasks", formData);
      }

      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        status: "Pending",
        priority: "Medium",
        dueDate: "",
        dueTime: "",
      });

      setErrors({});
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      alert(error.response?.data?.message || "Task save failed");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : "",
      dueTime: task.dueTime || "",
    });

    setErrors({});
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "bg-amber-400/20 text-amber-300";
    if (status === "In Progress") return "bg-sky-400/20 text-sky-300";
    if (status === "Completed") return "bg-emerald-400/20 text-emerald-300";
    return "bg-white/10 text-white";
  };

  const getPriorityColor = (priority) => {
    if (priority === "Low") return "bg-slate-400/20 text-slate-300";
    if (priority === "Medium") return "bg-orange-400/20 text-orange-300";
    if (priority === "High") return "bg-rose-400/20 text-rose-300";
    return "bg-white/10 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Tasks</h1>

          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="bg-slate-700 text-white px-4 py-2 rounded-xl"
            >
              Dashboard
            </Link>
            <Link
              to="/calendar"
              className="bg-cyan-500 text-white px-4 py-2 rounded-xl"
            >
              Calendar
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white mb-5">
              {editingId ? "Edit Task" : "Create Task"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 p-3 outline-none"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <textarea
                  name="description"
                  placeholder="Task description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 p-3 outline-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="assignedTo"
                  placeholder="Assigned to"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 p-3 outline-none"
                />
                {errors.assignedTo && (
                  <p className="text-red-400 text-sm mt-1">{errors.assignedTo}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-white p-3 outline-none"
                >
                  <option className="text-black">Pending</option>
                  <option className="text-black">In Progress</option>
                  <option className="text-black">Completed</option>
                </select>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-white p-3 outline-none"
                >
                  <option className="text-black">Low</option>
                  <option className="text-black">Medium</option>
                  <option className="text-black">High</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 border border-white/10 text-white p-3 outline-none"
                  />
                  {errors.dueDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    name="dueTime"
                    value={formData.dueTime}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/10 border border-white/10 text-white p-3 outline-none"
                  />
                  {errors.dueTime && (
                    <p className="text-red-400 text-sm mt-1">{errors.dueTime}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold"
              >
                {editingId ? "Update Task" : "Create Task"}
              </button>
            </form>
          </div>

          <div className="space-y-5">
            {tasks.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-slate-300">
                No tasks yet
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{task.title}</h3>
                      <p className="text-slate-300 mt-1">
                        {task.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-4 text-slate-300 text-sm space-y-1">
                    <p><strong>Assigned:</strong> {task.assignedTo || "Not assigned"}</p>
                    <p><strong>Date:</strong> {task.dueDate ? task.dueDate.substring(0, 10) : "No date"}</p>
                    <p><strong>Time:</strong> {task.dueTime || "No time"}</p>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TasksPage;