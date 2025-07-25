const Pac = require('../models/Pac');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new pac
const createPac = async (req, res) => {
  try {
    const { title, description, content, category, tags, isPublic, userId } = req.body;

    const newPac = new Pac({
      title,
      description,
      content,
      category,
      tags,
      isPublic,
      userId
    });

    const savedPac = await newPac.save();
    res.status(201).json({
      success: true,
      message: 'Pac created successfully',
      data: savedPac
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating pac',
      error: error.message
    });
  }
};

// Get public pacs with pagination and filtering
const getPublicPacs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const pacs = await Pac.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pac.countDocuments(filter);

    res.json({
      success: true,
      data: pacs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pacs',
      error: error.message
    });
  }
};

// Get user's pacs (private + public)
const getUserPacs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pacs = await Pac.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pac.countDocuments({ userId });

    res.json({
      success: true,
      data: pacs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user pacs',
      error: error.message
    });
  }
};

// Delete a pac
const deletePac = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPac = await Pac.findByIdAndDelete(id);

    if (!deletedPac) {
      return res.status(404).json({
        success: false,
        message: 'Pac not found'
      });
    }

    res.json({
      success: true,
      message: 'Pac deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pac',
      error: error.message
    });
  }
};

// AI-powered pac summarization
const summarizePac = async (req, res) => {
  try {
    const { id } = req.params;
    const pac = await Pac.findById(id);

    if (!pac) {
      return res.status(404).json({
        success: false,
        message: 'Pac not found'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please provide a concise summary of this content:
    
    Title: ${pac.title}
    Category: ${pac.category}
    Description: ${pac.description}
    Content: ${pac.content}
    
    Provide a 2-3 sentence summary that captures the main points and value.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({
      success: true,
      data: {
        pacId: id,
        title: pac.title,
        category: pac.category,
        summary: summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating summary',
      error: error.message
    });
  }
};

module.exports = {
  createPac,
  getPublicPacs,
  getUserPacs,
  deletePac,
  summarizePac
};
