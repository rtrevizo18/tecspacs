const express = require('express');
const router = express.Router();
const { checkJwt, populateUser } = require('../middleware/auth');
const { 
  getAllTecs, 
  createTec, 
  getTecById, 
  deleteTec, 
  updateTec,
  improveTec, 
  summarizeTec 
} = require('../controllers/tecController');

// Public routes
router.get('/', getAllTecs);

// Protected routes
router.post('/', checkJwt, populateUser, createTec);

// Public routes (must come after specific routes)
router.get('/:id', getTecById);

// Protected routes for AI features, updates, and deletion
router.patch('/:id', checkJwt, populateUser, updateTec);
router.delete('/:id', checkJwt, populateUser, deleteTec);
router.post('/:id/summarize', checkJwt, populateUser, summarizeTec);
router.post('/:id/improve', checkJwt, populateUser, improveTec);

module.exports = router; 