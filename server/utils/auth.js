const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Middleware function to authenticate user based on JWT token
  authMiddleware: function ({ req }) {
    // Extract the token from the request body, query parameters, or authorization header
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If the token is sent in the authorization header, remove the 'Bearer' prefix
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If no token is present, return the request as it is
    if (!token) {
      return req;
    }

    try {
      // Verify the token using the secret and extract user data from it
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      // If the token is invalid, log an error (optional, you might want to handle it differently)
      console.log('Invalid token');
    }

    // Return the request with user data if the token is valid
    return req;
  },

  // Function to sign a new JWT token based on user data
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    // Sign the payload with the secret and set expiration time
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
