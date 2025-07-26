const express = require('express');
const router = express.Router();
const { checkJwt, populateUser } = require('../middleware/auth');
const { getCurrentUser, createUserProfile } = require('../controllers/userController');

// Protected routes
router.get('/me', checkJwt, populateUser, getCurrentUser);
router.post('/profile', checkJwt, populateUser, createUserProfile);

module.exports = router; 