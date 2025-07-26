export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'dev-z8vumng8vd7v16a5.us.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'CNqz0VNkRJIsFHcRDQPns9AKKHfteQTJ',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.tecspacs.dev/',
  redirectUri: window.location.origin,
};