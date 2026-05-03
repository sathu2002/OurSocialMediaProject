import { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Link } from "react-router-dom";

function CalendarPage() {
  const [events, setEvents] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");

      const formattedEvents = res.data
        .filter((task) => task.dueDate)
        .map((task) => {
          let color = "#f59e0b";
          if (task.status === "In Progress") color = "#0ea5e9";
          if (task.status === "Completed") color = "#10b981";

          return {
            id: task._id,
            title: task.dueTime ? `${task.dueTime} - ${task.title}` : task.title,
            start: task.dueDate.split("T")[0],
            backgroundColor: color,
            borderColor: color,
          };
        });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching calendar tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Calendar View</h1>
            <p className="text-slate-300 mt-2">
              Task dates and event names
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/dashboard" className="bg-slate-700 text-white px-4 py-2 rounded-xl">
              Dashboard
            </Link>
            <Link to="/tasks" className="bg-cyan-500 text-white px-4 py-2 rounded-xl">
              Tasks
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;