const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Room = require("../models/room");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/bookroom", async (req, res) => {
  const { room, userid, fromdate, todate, totalamount, totaldays, token } =
    req.body;
  console.log("Received token:", token);
  try {
    if (!token || !token.email || !token.id) {
      return res.status(400).json({ error: "Invalid token object" });
    }

    // Create customer and charge payment
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    const payment = await stripe.charges.create({
      amount: totalamount * 100,
      currency: "usd",
      customer: customer.id,
    });

    // Handle payment success
    if (payment && payment.status === "succeeded") {
      // Create new booking
      const newbooking = new Booking({
        room: room.name,
        roomid: room._id,
        userid,
        fromdate,
        todate,
        totalamount,
        totaldays,
        transactionId: payment.id,
      });

      const booking = await newbooking.save();

      // Update room with new booking
      const roomtemp = await Room.findOne({ _id: room._id });
      roomtemp.currentbookings.push({
        bookingid: booking._id,
        fromdate: fromdate,
        todate: todate,
        userid: userid,
        status: booking.status,
      });
      await roomtemp.save();

      return res.send("Payment successful, your room is booked");
    } else {
      return res.status(400).json({ error: "Payment failed" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/getbookingsbyuserid", async (req, res) => {
  const userid = req.body.userid;

  try {
    const bookings = await Booking.find({ userid: userid });
    res.send(bookings);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
router.post("/cancelbooking", async (req, res) => {
  const { bookingid, roomid } = req.body;

  try {
    const booking = await Booking.findOne({ _id: bookingid });
    booking.status = "cancelled";
    await booking.save();
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const temp = bookings.filter(
      (booking) => booking.bookingid.toString() !== bookingid,
    );
    room.currentbookings = temp;
    await room.save();
    res.send("bookings cancelled successfully");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
router.get("/getallbookings", async (req, res) => {
  const { bookingid, roomid } = req.body;

  try {
    const bookings = await Booking.find();
    res.send(bookings);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
