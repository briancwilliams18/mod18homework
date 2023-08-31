const mongoose = require('mongoose');
const { DateTime } = require('luxon'); // Import Luxon for date formatting

const thoughtSchema = new mongoose.Schema({
  thoughtText: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (createdAt) => DateTime.fromJSDate(createdAt).toFormat('yyyy-MM-dd HH:mm:ss'),
  },
  username: {
    type: String,
    required: true,
  },
  reactions: [ReactionSchema], // Assuming you've defined ReactionSchema
});

// Create a virtual field for reactionCount
thoughtSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

const Thought = mongoose.model('Thought', thoughtSchema);

module.exports = Thought;
