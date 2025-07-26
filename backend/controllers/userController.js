const User = require('../models/User');

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

module.exports = {
  getCurrentUser,
  createUserProfile
}; 