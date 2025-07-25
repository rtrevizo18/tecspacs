// models/Tec.js --Eg
const mongoose = require('mongoose');
const TecSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: String,
  tag: String,
  user: String, // Add whatever fields are required by business logic
});
module.exports = mongoose.model('Tec', TecSchema);
