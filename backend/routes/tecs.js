// routes/tecs.js
const express = require('express');
const router = express.Router();
const tc = require('../controllers/tecController');

router.post('/', tc.createTec);             // Create
router.get('/', tc.getPublicTecs);          // Read with pagination/filter
router.get('/user/:userId', tc.getUserTecs);    // Get user's private tecs
router.delete('/:id', tc.deleteTec);        // Delete
router.post('/:id/summarize', tc.summarizeTec); // Gemini AI endpoint
router.post('/:id/improve', tc.improveTec);     // Gemini AI improve endpoint

module.exports = router;
