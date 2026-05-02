const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager'), getUsers)
  .post(authorize('Admin'), createUser);

router.route('/:id')
  .get(authorize('Admin', 'Manager'), getUserById)
  .put(authorize('Admin'), updateUser)
  .delete(authorize('Admin'), deleteUser);

module.exports = router;
