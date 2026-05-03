const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: String,
  status: {
    type: String,
    default: "Pending",
  },
  priority: {
    type: String,
    default: "Medium",
  },
  dueDate: Date,
  dueTime: String,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;