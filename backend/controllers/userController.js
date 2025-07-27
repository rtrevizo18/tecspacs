const User = require('../models/User');
const Pac = require('../models/Pac');
const Tec = require('../models/Tec');
const { isValidObjectId } = require('../utils/objectIdValidation');

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    let user = await User.findOne({ auth0Id: req.user.auth0Id })
      .populate('tecs', 'title description')
      .populate('pacs', 'name description');
    
    if (!user) {
      // Auto-create user if they don't exist
      const auth0Id = req.user.auth0Id;
      
      // Generate fallback values if not provided in token
      let email = req.user.email;
      let username = req.user.username;
      
      if (!email || email === 'undefined') {
        // Handle different Auth0 ID formats
        let userId;
        if (auth0Id.includes('@clients')) {
          // Client credentials format: "client_id@clients"
          userId = auth0Id.split('@')[0];
        } else if (auth0Id.includes('|')) {
          // User token format: "auth0|123456"
          userId = auth0Id.split('|')[1];
        } else {
          // Fallback
          userId = auth0Id.replace(/[^a-zA-Z0-9]/g, '');
        }
        email = `${userId}@auth0.com`;
      }
      
      if (!username || username === 'undefined') {
        // Handle different Auth0 ID formats
        let userId;
        if (auth0Id.includes('@clients')) {
          // Client credentials format: "client_id@clients"
          userId = auth0Id.split('@')[0];
        } else if (auth0Id.includes('|')) {
          // User token format: "auth0|123456"
          userId = auth0Id.split('|')[1];
        } else {
          // Fallback
          userId = auth0Id.replace(/[^a-zA-Z0-9]/g, '');
        }
        username = `user_${userId}`;
      }
      
      // Create new user
      user = new User({
        auth0Id: auth0Id,
        email: email,
        username: username,
        tecs: [],
        pacs: []
      });
      
      await user.save();
      console.log(`✅ Auto-created user: ${username} (${email})`);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create user profile (for frontend registration)
const createUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ auth0Id: req.user.auth0Id });

    if (user) {
      return res.status(400).json({ message: 'User profile already exists' });
    }

    // Create new user profile
    user = new User({
      auth0Id: req.user.auth0Id,
      username,
      email
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    res.status(500).json({ message: 'Error creating user profile', error: error.message });
  }
};

// Get all PACs for a specific user
const getUserPacs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        message: 'Invalid User ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: userId,
        example: '507f1f77bcf86cd799439011'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'No user found with the provided ID',
        receivedId: userId
      });
    }
    
    // Get all PACs created by this user
    const pacs = await Pac.find({ createdBy: userId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
      pacs: pacs,
      count: pacs.length
    });
  } catch (error) {
    console.error('Error fetching user PACs:', error);
    res.status(500).json({ 
      message: 'Error fetching user PACs', 
      error: error.message,
      receivedId: req.params.userId
    });
  }
};

// Get all TECs for a specific user
const getUserTecs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ObjectId format
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ 
        message: 'Invalid User ID format',
        error: 'ObjectId must be a 24-character hex string',
        receivedId: userId,
        example: '507f1f77bcf86cd799439011'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'No user found with the provided ID',
        receivedId: userId
      });
    }
    
    // Get all TECs created by this user
    const tecs = await Tec.find({ createdBy: userId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
      tecs: tecs,
      count: tecs.length
    });
  } catch (error) {
    console.error('Error fetching user TECs:', error);
    res.status(500).json({ 
      message: 'Error fetching user TECs', 
      error: error.message,
      receivedId: req.params.userId
    });
  }
};

module.exports = {
  getCurrentUser,
  createUserProfile,
  getUserPacs,
  getUserTecs
}; 