const Tec = require('../models/Tec');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new tec
const createTec = async (req, res) => {
  try {
    const { title, description, content, language, tags, difficulty, isPublic, userId } = req.body;

    const newTec = new Tec({
      title,
      description,
      content,
      language,
      tags,
      difficulty,
      isPublic,
      userId
    });

    const savedTec = await newTec.save();
    res.status(201).json({
      success: true,
      message: 'Tec created successfully',
      data: savedTec
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating tec',
      error: error.message
    });
  }
};

// Get public tecs with pagination and filtering
const getPublicTecs = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, tag, difficulty } = req.query;

    // Build filter object
    const filter = { isPublic: true };
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };

    const tecs = await Tec.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tec.countDocuments(filter);

    res.json({
      success: true,
      data: tecs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tecs',
      error: error.message
    });
  }
};

// Get user's tecs (private + public)
const getUserTecs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const tecs = await Tec.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tec.countDocuments({ userId });

    res.json({
      success: true,
      data: tecs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user tecs',
      error: error.message
    });
  }
};

// Delete a tec
const deleteTec = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTec = await Tec.findByIdAndDelete(id);

    if (!deletedTec) {
      return res.status(404).json({
        success: false,
        message: 'Tec not found'
      });
    }

    res.json({
      success: true,
      message: 'Tec deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tec',
      error: error.message
    });
  }
};

// AI-powered tec summarization
const summarizeTec = async (req, res) => {
  try {
    const { id } = req.params;
    const tec = await Tec.findById(id);

    if (!tec) {
      return res.status(404).json({
        success: false,
        message: 'Tec not found'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please provide a concise summary of this technical content:
    
    Title: ${tec.title}
    Language: ${tec.language}
    Content: ${tec.content}
    
    Provide a 2-3 sentence summary that captures the key concepts and purpose.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({
      success: true,
      data: {
        tecId: id,
        title: tec.title,
        language: tec.language,
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

// AI-powered tec improvement suggestions
const improveTec = async (req, res) => {
  try {
    const { id } = req.params;
    const tec = await Tec.findById(id);

    if (!tec) {
      return res.status(404).json({
        success: false,
        message: 'Tec not found'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this technical content and provide improvement suggestions:
    
    Title: ${tec.title}
    Description: ${tec.description}
    Language: ${tec.language}
    Difficulty: ${tec.difficulty}
    Content: ${tec.content}
    
    Please provide:
    1. 2-3 specific suggestions to improve the content quality
    2. Recommendations for better structure or organization
    3. Suggestions for additional topics to cover
    
    Keep suggestions practical and actionable.`;

    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    res.json({
      success: true,
      data: {
        tecId: id,
        title: tec.title,
        currentDifficulty: tec.difficulty,
        suggestions: suggestions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating improvement suggestions',
      error: error.message
    });
  }
};

module.exports = {
  createTec,
  getPublicTecs,
  getUserTecs,
  deleteTec,
  summarizeTec,
  improveTec
};
