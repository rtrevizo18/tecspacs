const express = require('express');
const router = express.Router();
const {
  createPac,
  getPublicPacs,
  getUserPacs,
  deletePac,
  summarizePac
} = require('../controllers/pacController');

// @route   GET /pacs
// @desc    Get all public pacs with pagination and filtering
// @access  Public
router.get('/', getPublicPacs);

// @route   POST /pacs
// @desc    Create a new pac
// @access  Private (requires authentication in production)
router.post('/', createPac);

// @route   GET /pacs/user/:userId
// @desc    Get pacs by user ID (both public and private)
// @access  Private (user can see their own pacs)
router.get('/user/:userId', getUserPacs);

// @route   DELETE /pacs/:id
// @desc    Delete a pac by ID
// @access  Private (owner only)
router.delete('/:id', deletePac);

// @route   POST /pacs/:id/summarize
// @desc    Get AI-powered summary of a pac
// @access  Public
router.post('/:id/summarize', summarizePac);

module.exports = router;
