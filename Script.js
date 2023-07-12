const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")
app.use(express.json());
app.use(cors());
const { v4: uuidv4 } = require('uuid');
const db = require("./db")
const PORT = process.env.PORT || 4000;
db.connect()
const Room = require("./models/roomSchema")
const Booking = require("./models/bookingSchema");
const { error } = require('console');

function generateUniqueId() {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
    const randomString = Math.random().toString(36).substr(2, 5); // Generate a random string
    const uniqueId = timestamp + randomString; // Concatenate the timestamp and random string
    return uniqueId;
  }

  function generateUniqueIdbooking() {
    return uuidv4();
  }
  
// API endpoints
app.post('/rooms', (req, res) => {
    const { seats, amenities, price } = req.body; // Assuming the request body contains seats, amenities, and price
  
    // Validate input data
    if (!seats || !amenities || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const newRoom = new Room ( {
      id: generateUniqueId(), // Assuming you have a function to generate a unique ID for the room
      seats,
      amenities,
      price,
    });
  
    newRoom.save()
    .then(newRoom => {
        console.log('Entry saved');
    })
    .catch(err => {
        console.log(err);
    });
    
  
    return res.status(201).json({ room: newRoom });
  });
  
  app.post("/bookings", async (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;
  
    // Validate input data
    if (!customerName || !date || !startTime || !endTime || !roomId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      // Check for room availability
      const room = await Room.findOne({ id: roomId });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
  
      const conflictingBooking = await Booking.findOne({
        roomId,
        date,
        $or: [
          { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
          { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        ],
      });
  
      if (conflictingBooking) {
        return res
          .status(409)
          .json({ error: "Room already booked for the specified date and time" });
      }
  
      const newBooking = new Booking({
        customerName,
        date,
        startTime,
        endTime,
        roomId,
      });
  
      const savedBooking = await newBooking.save();
      console.log("Booking saved:", savedBooking);
      return res.status(201).json({ booking: savedBooking });
    } catch (error) {
      console.log("Error saving booking:", error);
      return res.status(500).json({ error: "Failed to save booking" });
    }
  });

  app.get('/rooms', (req, res) => {
    // Retrieve all rooms from the database
    Room.find()
      .then(rooms => {
        // Fetch bookings for each room
        const roomPromises = rooms.map(room => {
          // Find bookings for the current room
          return Booking.find({ roomId: room.id })
            .then(bookings => {
              // Add booking details to the room object
              room.bookings = bookings.map(booking => {
                return {
                  customerName: booking.customerName,
                  date: booking.date,
                  startTime: booking.startTime,
                  endTime: booking.endTime
                };
              });
              return room;
            });
        });
  
        // Wait for all roomPromises to resolve
        Promise.all(roomPromises)
          .then(roomsWithBookings => {
            // Prepare the response data
            const responseData = roomsWithBookings.map(room => {
              const roomData = {
                roomName: room.name,
                bookedStatus: room.bookings.length > 0,
                bookings: room.bookings
              };
              return roomData;
            });
  
            res.status(200).json({ rooms: responseData });
          })
          .catch(error => {
            console.log('Error fetching bookings:', error);
            res.status(500).json({ error: 'Failed to fetch bookings' });
          });
      })
      .catch(error => {
        console.log('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
      });
  });
  
  app.get('/customers', (req, res) => {
    // Retrieve all bookings from the database
    Booking.find()
      .then(bookings => {
        // Get unique customer names from the bookings
        const uniqueCustomers = [...new Set(bookings.map(booking => booking.customerName))];
  
        // Create an array to hold customers with their booked data
        const customersWithBookedData = [];
  
        // Iterate over unique customers and filter bookings for each customer
        uniqueCustomers.forEach(customer => {
          const customerBookings = bookings.filter(booking => booking.customerName === customer);
          const customerData = customerBookings.map(booking => {
            return {
              customerName: customer,
              roomName: booking.roomName,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime
            };
          });
          customersWithBookedData.push(...customerData);
        });
  
        res.status(200).json({ customers: customersWithBookedData });
      })
      .catch(error => {
        console.log('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
      });
  });

  app.get('/bookings/:customerId/:roomId', (req, res) => {
    const customerId = req.params.customerId;
    const roomId = req.params.roomId;
  
    // Retrieve bookings that match the customerId and roomId
    Booking.find({ customerId: customerId, roomId: roomId })
      .then(bookings => {
        const bookingCount = bookings.length;
  
        const responseData = bookings.map(booking => {
          return {
            customerName: booking.customerName,
            roomName: booking.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingId: booking.id,
            bookingDate: booking.bookingDate,
            bookingStatus: booking.bookingStatus
          };
        });
  
        res.status(200).json({
          customerId: customerId,
          roomId: roomId,
          bookingCount: bookingCount,
          bookings: responseData
        });
      })
      .catch(error => {
        console.log('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
      });
  });
  
  
app.listen(4000, () => {
  console.log(`Server started on port: ${PORT}`);
});
