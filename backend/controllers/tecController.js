const Tec = require('../models/Tec');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/objectIdValidation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    
    const tec = await Tec.findByIdAndDelete(id);
    
    if (!tec) {
      return res.status(404).json({ 
        message: 'TEC not found',
        error: 'No TEC found with the provided ID',
        receivedId: id
      });
    }
    
    res.json({ message: 'TEC deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting TEC', error: error.message });
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please suggest improvements for this technical snippet:
    
    Title: ${tec.title}
    Description: ${tec.description}
    Language: ${tec.language}
    Content: ${tec.content}
    Tags: ${tec.tags ? tec.tags.join(', ') : 'None'}
    
    Provide 3-5 specific suggestions for improving this code or technical approach, focusing on:
    - Performance optimizations
    - Best practices
    - Security considerations
    - Code readability
    - Modern alternatives`;

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
    res.status(500).json({ 
      error: 'Failed to generate improvements',
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please provide a concise summary of this technical snippet:
    
    Title: ${tec.title}
    Description: ${tec.description}
    Language: ${tec.language}
    Content: ${tec.content}
    Tags: ${tec.tags ? tec.tags.join(', ') : 'None'}
    
    Please summarize what this appears to be and its potential use case in 2-3 sentences.`;

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
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message 
    });
  }
};

module.exports = {
  getAllTecs,
  createTec,
  getTecById,
  deleteTec,
  improveTec,
  summarizeTec
}; 