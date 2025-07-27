const Tec = require('../models/Tec');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/objectIdValidation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple rate limiting for AI endpoints
const aiRequestTimes = new Map();
const AI_RATE_LIMIT_MS = 60000; // 1 minute between requests

// Get all tecs
const getAllTecs = async (req, res) => {
  try {
    const tecs = await Tec.find().populate('createdBy', 'username');
    res.json(tecs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tecs', error: error.message });
  }
};

// Create a new tec
const createTec = async (req, res) => {
  try {
    const { title, description, language, content, tags } = req.body;
    
    // Find or create user based on Auth0 ID
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please complete your profile first.' });
    }

    const tec = new Tec({
      title,
      description,
      language,
      content,
      tags,
      createdBy: user._id
    });

    const savedTec = await tec.save();
    
    // Add tec to user's tecs array
    user.tecs.push(savedTec._id);
    await user.save();

    res.status(201).json(savedTec);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tec', error: error.message });
  }
};

// Get tec by ID
const getTecById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid TEC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id,
        example: '507f1f77bcf86cd799439011'
      });
    }
    
    const tec = await Tec.findById(id).populate('createdBy', 'username');
    
    if (!tec) {
      return res.status(404).json({ 
        message: 'TEC not found',
        error: 'No TEC found with the provided ID',
        receivedId: id
      });
    }
    
    res.json(tec);
  } catch (error) {
    console.error('Error fetching TEC by ID:', error);
    res.status(500).json({ 
      message: 'Error fetching TEC', 
      error: error.message,
      receivedId: req.params.id
    });
  }
};

// Delete tec
const deleteTec = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid TEC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    // Check if user is properly populated
    if (!req.user || !req.user._id) {
      console.error('User not properly populated in deleteTec:', req.user);
      return res.status(500).json({ 
        message: 'Authentication error',
        error: 'User information not properly loaded'
      });
    }
    
    // Find the TEC first to check ownership
    const tec = await Tec.findById(id);
    
    if (!tec) {
      return res.status(404).json({ 
        message: 'TEC not found',
        error: 'No TEC found with the provided ID',
        receivedId: id
      });
    }
    
    // Check if the current user owns this TEC
    if (tec.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'You can only delete your own TECs'
      });
    }
    
    // Delete the TEC
    await Tec.findByIdAndDelete(id);
    
    // Remove TEC from user's tecs array
    const user = await User.findById(req.user._id);
    if (user) {
      user.tecs = user.tecs.filter(tecId => tecId.toString() !== id);
      await user.save();
    }
    
    res.json({ message: 'TEC deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTec:', error);
    res.status(500).json({ message: 'Error deleting TEC', error: error.message });
  }
};

// Update tec
const updateTec = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, language, content, tags } = req.body;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid TEC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    // Check if user is properly populated
    if (!req.user || !req.user._id) {
      console.error('User not properly populated in updateTec:', req.user);
      return res.status(500).json({ 
        message: 'Authentication error',
        error: 'User information not properly loaded'
      });
    }
    
    // Find the TEC first to check ownership
    const tec = await Tec.findById(id);
    
    if (!tec) {
      return res.status(404).json({ 
        message: 'TEC not found',
        error: 'No TEC found with the provided ID',
        receivedId: id
      });
    }
    
    // Check if the current user owns this TEC
    if (tec.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'You can only update your own TECs'
      });
    }
    
    // Update the TEC with provided fields
    const updateData = {};
    if (title !== undefined && title.trim() !== '') updateData.title = title;
    if (description !== undefined && description.trim() !== '') updateData.description = description;
    if (language !== undefined && language.trim() !== '') updateData.language = language;
    if (content !== undefined && content.trim() !== '') updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    const updatedTec = await Tec.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');
    
    res.json(updatedTec);
  } catch (error) {
    console.error('Error in updateTec:', error);
    res.status(500).json({ message: 'Error updating TEC', error: error.message });
  }
};

// Gemini AI integration for improving tecs
const improveTec = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid TEC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    const tec = await Tec.findById(id);
    if (!tec) {
      return res.status(404).json({ error: 'Tec not found' });
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = aiRequestTimes.get('improve');
    if (lastRequest && (now - lastRequest) < AI_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((AI_RATE_LIMIT_MS - (now - lastRequest)) / 1000);
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `Please wait ${waitTime} seconds before making another AI request`,
        retryAfter: waitTime
      });
    }
    aiRequestTimes.set('improve', now);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Improve this code snippet (${tec.language}): ${tec.title}
    
    ${tec.content}
    
    Provide 3-5 specific improvements for performance, security, readability, and best practices.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvements = response.text();

    res.json({ 
      improvements,
      tecId: tec._id,
      tecTitle: tec.title 
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    
    // Handle specific Gemini API errors
    if (error.message.includes('429') || error.message.includes('quota')) {
      return res.status(429).json({ 
        error: 'AI service temporarily unavailable',
        message: 'Google Gemini API quota exceeded. Please try again later.',
        details: 'Rate limit or daily quota reached. Consider upgrading your Google AI plan.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate improvements',
      message: 'AI service error. Please try again later.',
      details: error.message 
    });
  }
};

// Gemini AI integration for summarizing tecs
const summarizeTec = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid TEC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    const tec = await Tec.findById(id);
    if (!tec) {
      return res.status(404).json({ error: 'Tec not found' });
    }

    // Rate limiting check
    const now = Date.now();
    const lastRequest = aiRequestTimes.get('summarize');
    if (lastRequest && (now - lastRequest) < AI_RATE_LIMIT_MS) {
      const waitTime = Math.ceil((AI_RATE_LIMIT_MS - (now - lastRequest)) / 1000);
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `Please wait ${waitTime} seconds before making another AI request`,
        retryAfter: waitTime
      });
    }
    aiRequestTimes.set('summarize', now);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Summarize this code snippet (${tec.language}): ${tec.title}
    
    ${tec.content}
    
    Provide a 2-3 sentence summary of what this does and its use case.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ 
      summary,
      tecId: tec._id,
      tecTitle: tec.title 
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    
    // Handle specific Gemini API errors
    if (error.message.includes('429') || error.message.includes('quota')) {
      return res.status(429).json({ 
        error: 'AI service temporarily unavailable',
        message: 'Google Gemini API quota exceeded. Please try again later.',
        details: 'Rate limit or daily quota reached. Consider upgrading your Google AI plan.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate summary',
      message: 'AI service error. Please try again later.',
      details: error.message 
    });
  }
};

module.exports = {
  getAllTecs,
  createTec,
  getTecById,
  deleteTec,
  updateTec,
  improveTec,
  summarizeTec
}; 