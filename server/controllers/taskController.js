const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate, dueTime } = req.body;

   if (
  !title ||
  title.trim().length < 3 ||
  !description ||
  description.trim().length < 3 ||
  !assignedTo ||
  assignedTo.trim().length < 3 ||
  !dueDate ||
  !dueTime
) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      dueTime,  
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, dueTime } = req.body;

    if (!title || !description || !assignedTo || !dueDate || !dueTime) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };