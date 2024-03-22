const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true 
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  secure: {
    type: Boolean,
    default: false 
  },
  level: {
    type: Number,
    default: 0 
  },
  tokens:{
    type: Number,
    default: 50
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
