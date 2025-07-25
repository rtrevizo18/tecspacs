// models/Pec.js --Eg
const mongoose = require('mongoose');
const PacSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: String,
  tag: String,
  user: String, // Add whatever fields are required by business logic
});
module.exports = mongoose.model('Pac', PacSchema);
