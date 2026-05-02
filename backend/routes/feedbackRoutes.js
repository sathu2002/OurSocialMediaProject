const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager', 'Staff', 'Client'), getFeedback)
  .post(authorize('Admin', 'Manager', 'Staff', 'Client'), createFeedback);

router.get('/my', authorize('Client'), getMyFeedback);

router.route('/:id')
  .put(authorize('Admin', 'Manager', 'Staff', 'Client'), updateFeedback)
  .delete(authorize('Admin', 'Manager', 'Staff', 'Client'), deleteFeedback);

module.exports = router;
