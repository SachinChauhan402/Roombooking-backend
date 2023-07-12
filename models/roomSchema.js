const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    id: { type: String, unique: true },
  seats: {
    type: Number,
    required: true
  },
  amenities: {
    type: [String],
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
