const express = require('express');
const router = express.Router();
const { checkJwt, populateUser } = require('../middleware/auth');
const { 
  getCurrentUser, 
  createUserProfile, 
  getUserPacs, 
  getUserTecs 
} = require('../controllers/userController');

// Protected routes
router.get('/me', checkJwt, populateUser, getCurrentUser);
router.post('/profile', checkJwt, populateUser, createUserProfile);

// Public routes to get user's PACs and TECs
router.get('/:userId/pacs', getUserPacs);
router.get('/:userId/tecs', getUserTecs);

module.exports = router; 