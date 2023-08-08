const express = require('express');
const path = require('path');
const db = require('./config/connection');
// add apollo server
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

// Create an instance of ApolloServer with typeDefs, resolvers, and the authMiddleware as context
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Middleware to parse request body as JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Route for the homepage, serving the React build index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Async function to start ApolloServer
const startApolloServer = async () => {
  // Start the ApolloServer
  await server.start();
  // Apply ApolloServer middleware to the Express app
  server.applyMiddleware({ app });

  // Once the database connection is open, start listening for incoming requests
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer();
