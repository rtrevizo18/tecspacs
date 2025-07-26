const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  tecs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tec'
  }],
  pacs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pac'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 