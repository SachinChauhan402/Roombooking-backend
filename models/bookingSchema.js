const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    customerName: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    roomId: { type: String, required: true },
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
