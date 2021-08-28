const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  post_text: { type: String, default: null }
});

module.exports = mongoose.model("post", postSchema);