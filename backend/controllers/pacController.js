// controllers/pacController.js
const Pac = require("../models/Pac");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.createPac = async (req, res) => {
  try {
    const pac = await Pac.create(req.body);
    res.status(201).json(pac);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.getPublicPacs = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const query = {};
    if (language) query.language = language;
    if (tag) query.tag = tag;
    const pacs = await Pac.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(pacs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getUserPacs = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, tag } = req.query;
    const { userId } = req.params;
    const query = { user: userId };
    if (language) query.language = language;
    if (tag) query.tag = tag;
    const pacs = await Pac.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(pacs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.deletePac = async (req, res) => {
  try {
    await Pac.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

exports.summarizePac = async (req, res) => {
  try {
    const pac = await Pac.findById(req.params.id);
    if (!pac) {
      return res.status(404).json({ error: "Pac not found" });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Please provide a concise summary of this code package: Name: ${pac.name}, Language: ${pac.language || "Not specified"}, Tag: ${pac.tag || "Not specified"}. Please summarize what this appears to be and its potential use case in 2-3 sentences.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    res.json({ summary, pacId: pac._id, pacName: pac.name });
  } catch (e) {
    console.error("Gemini API Error:", e.message);
    res.status(500).json({ error: "Failed to generate summary", details: e.message });
  }
};
