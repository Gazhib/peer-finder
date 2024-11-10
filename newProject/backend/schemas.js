/* eslint-disable no-undef */
const { Schema } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  interests: {
    type: Array,
  },
  career: {
    type: Array,
  },
  yearOfStudy: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
  },
  telegram: {
    type: String,
  },
  liked: {
    type: Array,
  },
  wasLiked: {
    type: Array,
  }
});

module.exports = { userSchema };
