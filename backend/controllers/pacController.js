const Pac = require('../models/Pac');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/objectIdValidation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple rate limiting for AI endpoints
const aiRequestTimes = new Map();
const AI_RATE_LIMIT_MS = 60000; // 1 minute between requests

// Get all pacs
const getAllPacs = async (req, res) => {
  try {
    const pacs = await Pac.find().populate('createdBy', 'username');
    res.json(pacs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pacs', error: error.message });
  }
};

// Create a new pac
const createPac = async (req, res) => {
  try {
    const { name, description, dependencies, files } = req.body;
    
    // Find user based on Auth0 ID
    let user = await User.findOne({ auth0Id: req.user.auth0Id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please complete your profile first.' });
    }

    const pac = new Pac({
      name,
      description,
      dependencies,
      files,
      createdBy: user._id
    });

    const savedPac = await pac.save();
    
    // Add pac to user's pacs array
    user.pacs.push(savedPac._id);
    await user.save();

    res.status(201).json(savedPac);
  } catch (error) {
    res.status(500).json({ message: 'Error creating pac', error: error.message });
  }
};

// Get pac by ID
const getPacById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid PAC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id,
        example: '507f1f77bcf86cd799439011'
      });
    }
    
    const pac = await Pac.findById(id).populate('createdBy', 'username');
    
    if (!pac) {
      return res.status(404).json({ 
        message: 'PAC not found',
        error: 'No PAC found with the provided ID',
        receivedId: id
      });
    }
    
    res.json(pac);
  } catch (error) {
    console.error('Error fetching PAC by ID:', error);
    res.status(500).json({ 
      message: 'Error fetching PAC', 
      error: error.message,
      receivedId: req.params.id
    });
  }
};

// Delete pac
const deletePac = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid PAC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    // Find the PAC first to check ownership
    const pac = await Pac.findById(id);
    
    if (!pac) {
      return res.status(404).json({ 
        message: 'PAC not found',
        error: 'No PAC found with the provided ID',
        receivedId: id
      });
    }
    
    // Check if the current user owns this PAC
    if (pac.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'You can only delete your own PACs'
      });
    }
    
    // Delete the PAC
    await Pac.findByIdAndDelete(id);
    
    // Remove PAC from user's pacs array
    const user = await User.findById(req.user._id);
    if (user) {
      user.pacs = user.pacs.filter(pacId => pacId.toString() !== id);
      await user.save();
    }
    
    res.json({ message: 'PAC deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting PAC', error: error.message });
  }
};

// Gemini AI integration for summarizing pacs
const summarizePac = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: 'Invalid PAC ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    const pac = await Pac.findById(id);
    if (!pac) {
      return res.status(404).json({ error: 'Pac not found' });
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
    
    const prompt = `Summarize this package: ${pac.name}
    
    ${pac.description}
    
    Provide a 2-3 sentence summary of what this package does and its use case.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ 
      summary,
      pacId: pac._id,
      pacName: pac.name 
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
  getAllPacs,
  createPac,
  getPacById,
  deletePac,
  summarizePac
}; 