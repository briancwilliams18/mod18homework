const mongoose = require('mongoose');
const { DateTime } = require('luxon'); // Import Luxon for date formatting

const reactionSchema = new mongoose.Schema({
  reactionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  reactionBody: {
    type: String,
    required: true,
    maxlength: 280,
  },
  username: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (createdAt) => DateTime.fromJSDate(createdAt).toFormat('yyyy-MM-dd HH:mm:ss'),
  },
});

module.exports = reactionSchema;