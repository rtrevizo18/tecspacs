const express = require('express');
const router = express.Router();
const { checkJwt, populateUser } = require('../middleware/auth');
const { 
  getAllTecs, 
  createTec, 
  getTecById, 
  deleteTec, 
  improveTec, 
  summarizeTec 
} = require('../controllers/tecController');

// Public routes
router.get('/', getAllTecs);

// Protected routes
router.post('/', checkJwt, populateUser, createTec);

// Public routes (must come after specific routes)
router.get('/:id', getTecById);

// Protected routes for AI features and deletion
router.delete('/:id', checkJwt, populateUser, deleteTec);
router.post('/:id/summarize', checkJwt, populateUser, summarizeTec);
router.post('/:id/improve', checkJwt, populateUser, improveTec);

module.exports = router; 