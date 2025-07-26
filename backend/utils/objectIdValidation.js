const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Middleware to validate ObjectId in request parameters
 * @param {string} paramName - The parameter name to validate (default: 'id')
 * @returns {Function} - Express middleware function
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({ 
        message: `${paramName} parameter is required`,
        error: 'Missing parameter'
      });
    }
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: `Invalid ${paramName} format`,
        error: 'ObjectId must be a 24-character hex string',
        receivedId: id
      });
    }
    
    next();
  };
};

module.exports = {
  isValidObjectId,
  validateObjectId
}; 