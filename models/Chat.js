const mongoose = require('mongoose');

// Define the Chat Schema
const chatSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

// Export the Chat model
module.exports = mongoose.model('Chat', chatSchema);
