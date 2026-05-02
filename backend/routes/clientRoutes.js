const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  registerClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public route for landing page registration
router.post('/register', registerClient);

// All routes below are protected
router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager', 'Staff'), getClients)
  .post(authorize('Admin', 'Manager'), createClient);

router.route('/:id')
  .get(getClientById) // Allowed for Admin, Manager, and the Client themselves (check inside controller)
  .put(updateClient) // Allowed for Admin, Manager, and Client themselves (partial update)
  .delete(authorize('Admin'), deleteClient); // Only Admin can delete

module.exports = router;
