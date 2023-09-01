const express = require('express');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const User = require('./models/User');
const Thought = require('./models/Thought');
const ReactionSchema = require('./models/Reaction'); // Assuming you've defined Reaction schema

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().populate('thoughts').populate('friends');
    res.json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('thoughts').populate('friends');
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    // Bonus: Remove user's associated thoughts
    await Thought.deleteMany({ userId: deletedUser._id });

    // Remove the user from other users' friend lists
    await User.updateMany(
      { friends: deletedUser._id },
      { $pull: { friends: deletedUser._id } }
    );

    res.status(204).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Add a friend to a user's friend list
app.post('/api/users/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { friends: req.params.friendId } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Remove a friend from a user's friend list
app.delete('/api/users/:userId/friends/:friendId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { friends: req.params.friendId } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Thoughts
app.get('/api/thoughts', async (req, res) => {
  try {
    const thoughts = await Thought.find();
    res.json(thoughts);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/api/thoughts/:id', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    res.json(thought);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/api/thoughts', async (req, res) => {
  try {
    const newThought = await Thought.create(req.body);
    const user = await User.findByIdAndUpdate(newThought.userId, { $push: { thoughts: newThought._id } });
    res.status(201).json(newThought);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put('/api/thoughts/:id', async (req, res) => {
  try {
    const updatedThought = await Thought.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedThought);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete('/api/thoughts/:id', async (req, res) => {
  try {
    const deletedThought = await Thought.findByIdAndDelete(req.params.id);

    // Remove thought's reactions if applicable
    if (deletedThought.reactions && deletedThought.reactions.length > 0) {
      // Delete the reactions associated with the thought
      await ReactionSchema.deleteMany({ _id: { $in: deletedThought.reactions } });
    }

    // Remove the thought from the associated user's thoughts array
    const user = await User.findByIdAndUpdate(deletedThought.userId, { $pull: { thoughts: deletedThought._id } });

    res.status(204).json({ message: 'Thought deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create a reaction for a thought
app.post('/api/thoughts/:thoughtId/reactions', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    thought.reactions.push(req.body);
    await thought.save();
    res.status(201).json(thought);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a reaction from a thought
app.delete('/api/thoughts/:thoughtId/reactions/:reactionId', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    thought.reactions.pull({ _id: req.params.reactionId });
    await thought.save();
    res.status(200).json(thought);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Start the server
mongoose.connect('mongodb://127.0.0.1:27017/social_network_db', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
