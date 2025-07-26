const express = require('express');
const router = express.Router();
const { checkJwt, populateUser } = require('../middleware/auth');
const { 
  getAllPacs, 
  createPac, 
  getPacById, 
  deletePac, 
  summarizePac 
} = require('../controllers/pacController');

// Public routes
router.get('/', getAllPacs);

// Protected routes
router.post('/', checkJwt, populateUser, createPac);

// Public routes (must come after specific routes)
router.get('/:id', getPacById);

// Protected routes for AI features and deletion
router.delete('/:id', checkJwt, populateUser, deletePac);
router.post('/:id/summarize', checkJwt, populateUser, summarizePac);

module.exports = router; 