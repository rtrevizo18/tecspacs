const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  }
});

// Middleware to populate req.user with Auth0 user ID
const populateUser = async (req, res, next) => {
  try {
    if (req.auth) {
      // First set basic Auth0 info
      req.user = {
        auth0Id: req.auth.sub,
        email: req.auth['https://api.tecspacs.dev/email'] || req.auth.email,
        username: req.auth['https://api.tecspacs.dev/username'] || req.auth.nickname || req.auth.name
      };
      
      // Then fetch the actual User document from database
      const User = require('../models/User');
      const userDoc = await User.findOne({ auth0Id: req.auth.sub });
      
      if (userDoc) {
        // Merge the database user document with Auth0 info
        req.user = {
          ...req.user,
          _id: userDoc._id,
          tecs: userDoc.tecs,
          pacs: userDoc.pacs,
          createdAt: userDoc.createdAt,
          updatedAt: userDoc.updatedAt
        };
      }
    }
    next();
  } catch (error) {
    console.error('Error in populateUser middleware:', error);
    next(error);
  }
};

module.exports = { checkJwt, populateUser }; 