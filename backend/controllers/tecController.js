// controllers/tecController.js
const Tec = require('../models/Tec');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.createTec = async (req, res) => {
  try {
    const tec = await Tec.create(req.body);
    res.status(201).json(tec);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getPublicTecs = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const query = {};
    if (language) query.language = language;
    if (tag) query.tag = tag;
    const tecs = await Tec.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(tecs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getUserTecs = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const { userId } = req.params; // or req.user.id if using auth middleware
    
    const query = { user: userId };
    if (language) query.language = language;
    if (tag) query.tag = tag;
    
    const tecs = await Tec.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(tecs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deleteTec = async (req, res) => {
  try {
    await Tec.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

// Gemini AI integration for improving tecs
exports.improveTec = async (req, res) => {
  try {
    const tec = await Tec.findById(req.params.id);
    if (!tec) {
      return res.status(404).json({ error: 'Tec not found' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Please suggest improvements for this technical snippet:
    
    Name: ${tec.name}
    Language: ${tec.language || 'Not specified'}
    Tag: ${tec.tag || 'Not specified'}
    
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
      tecName: tec.name 
    });
  } catch (e) {
    console.error('Gemini API Error:', e.message);
    res.status(500).json({ 
      error: 'Failed to generate improvements',
      details: e.message 
    });
  }
};

// Gemini AI integration for summarizing tecs
exports.summarizeTec = async (req, res) => {
  try {
    const tec = await Tec.findById(req.params.id);
    if (!tec) {
      return res.status(404).json({ error: 'Tec not found' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create a prompt based on the tec data
    const prompt = `Please provide a concise summary of this technical snippet:
    
    Name: ${tec.name}
    Language: ${tec.language || 'Not specified'}
    Tag: ${tec.tag || 'Not specified'}
    
    Please summarize what this appears to be and its potential use case in 2-3 sentences.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ 
      summary,
      tecId: tec._id,
      tecName: tec.name 
    });
  } catch (e) {
    console.error('Gemini API Error:', e.message);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: e.message 
    });
  }
};
