// Import necessary modules and utilities
const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// Import the bookSchema to be used within the userSchema
const bookSchema = require('./Book');

// Define the user schema using the Mongoose Schema constructor
const userSchema = new Schema(
  {
    // User's username field
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // User's email field
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    // User's password field
    password: {
      type: String,
      required: true,
    },
    // User's savedBooks field as an array of bookSchema
    savedBooks: [bookSchema],
  },
  {
    // Add virtual fields to the JSON representation of the schema
    toJSON: {
      virtuals: true,
    },
  }
);

// Middleware function to hash the user's password before saving it to the database
userSchema.pre('save', async function (next) {
  // Check if the password is new or has been modified before hashing
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    // Hash the password using bcrypt with the specified number of salt rounds
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Move to the next middleware
  next();
});

// Method to compare the provided password with the hashed password in the database
userSchema.methods.isCorrectPassword = async function (password) {
  // Use bcrypt to compare the provided password with the hashed password
  return bcrypt.compare(password, this.password);
};

// Virtual field to calculate the book count of the user (number of saved books)
userSchema.virtual('bookCount').get(function () {
  // Return the length of the savedBooks array
  return this.savedBooks.length;
});

// Create the User model using the userSchema
const User = model('User', userSchema);

// Export the User model
module.exports = User;
