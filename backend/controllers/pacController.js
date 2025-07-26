const Pac = require('../models/Pac');
const User = require('../models/User');
const { isValidObjectId } = require('../utils/objectIdValidation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    
    const pac = await Pac.findByIdAndDelete(id);
    
    if (!pac) {
      return res.status(404).json({ 
        message: 'PAC not found',
        error: 'No PAC found with the provided ID',
        receivedId: id
      });
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

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please provide a concise summary of this code package:
    
    Name: ${pac.name}
    Description: ${pac.description}
    Dependencies: ${pac.dependencies ? pac.dependencies.join(', ') : 'None'}
    Files: ${pac.files ? pac.files.join(', ') : 'None'}
    
    Please summarize what this appears to be and its potential use case in 2-3 sentences.`;

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
    res.status(500).json({ 
      error: 'Failed to generate summary',
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