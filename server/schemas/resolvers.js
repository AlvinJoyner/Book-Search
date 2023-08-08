// Import necessary modules and utilities
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

// Define resolvers for the GraphQL schema
const resolvers = {
  Query: {
    // Resolver for 'me' query to get the current user's data
    me: async (parent, args, context) => {
      // Check if the user is authenticated (present in the context)
      if (context.user) {
        // If authenticated, fetch and return the user's data, excluding sensitive fields
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        return userData;
      }
      // If user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("Not logged in");
    },
  },

  Mutation: {
    // Resolver for 'addUser' mutation to create a new user
    addUser: async (parent, args) => {
      // Create a new user based on the input arguments
      const user = await User.create(args);
      // Sign a new JWT token for the newly created user
      const token = signToken(user);
      // Return the signed token and the user object
      return { token, user };
    },

    // Resolver for 'login' mutation to authenticate an existing user
    login: async (parent, { email, password }) => {
      // Find the user with the provided email in the database
      const user = await User.findOne({ email });

      // If no user is found with the provided email, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError(
          "User not found. Do you already have an account?"
        );
      }

      // Check if the provided password matches the user's password
      const correctPassword = await user.isCorrectPassword(password);

      // If the password is incorrect, throw an AuthenticationError
      if (!correctPassword) {
        throw new AuthenticationError("Incorrect credentials");
      }

      // Sign a new JWT token for the authenticated user
      const token = signToken(user);
      // Return the signed token and the user object
      return { token, user };
    },

    // Resolver for 'saveBook' mutation to add a book to the user's savedBooks array
    saveBook: async (parent, { bookData }, context) => {
      // Check if the user is authenticated (present in the context)
      if (context.user) {
        // If authenticated, find the user by ID and add the book to their savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        );
        return updatedUser;
      }
      // If user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("You need to be logged in!");
    },

    // Resolver for 'removeBook' mutation to remove a book from the user's savedBooks array
    removeBook: async (parent, { bookId }, context) => {
      // Check if the user is authenticated (present in the context)
      if (context.user) {
        // If authenticated, find the user by ID and remove the book from their savedBooks array
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      // If user is not authenticated, throw an AuthenticationError
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

// Export the resolvers
module.exports = resolvers;
