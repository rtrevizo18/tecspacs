const express = require('express');
const router = express.Router();
const {
  createTec,
  getPublicTecs,
  getUserTecs,
  deleteTec,
  summarizeTec,
  improveTec
} = require('../controllers/tecController');

// @route   GET /tecs
// @desc    Get all public tecs with pagination and filtering
// @access  Public
router.get('/', getPublicTecs);

// @route   POST /tecs
// @desc    Create a new tec
// @access  Private (requires authentication in production)
router.post('/', createTec);

// @route   GET /tecs/user/:userId
// @desc    Get tecs by user ID (both public and private)
// @access  Private (user can see their own tecs)
router.get('/user/:userId', getUserTecs);

// @route   DELETE /tecs/:id
// @desc    Delete a tec by ID
// @access  Private (owner only)
router.delete('/:id', deleteTec);

// @route   POST /tecs/:id/summarize
// @desc    Get AI-powered summary of a tec
// @access  Public
router.post('/:id/summarize', summarizeTec);

// @route   POST /tecs/:id/improve
// @desc    Get AI-powered improvement suggestions for a tec
// @access  Private (owner only in production)
router.post('/:id/improve', improveTec);

module.exports = router;
