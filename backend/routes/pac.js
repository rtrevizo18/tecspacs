// routes/pacs.js
const express = require('express');
const router = express.Router();
const pc = require('../controllers/pacController');

router.post('/', pc.createPac);             // Create
router.get('/', pc.getPublicPacs);          // Read with pagination/filter
router.get('/user/:userId', pc.getUserPacs);    // Get user's private pacs
router.delete('/:id', pc.deletePac);        // Delete
router.post('/:id/summarize', pc.summarizePac); // Gemini AI endpoint

module.exports = router;
