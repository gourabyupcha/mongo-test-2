
const {getServiceById} = require('../utils/utils')
const express = require('express');
const router = express.Router();
const { getBookingCollection } = require('../db/db');
const redisClient = require('../utils/cache');
const crypto = require('crypto'); // For creating cache keys


// POST /api/services - Create a new service listing
// POST /api/bookings - Create a new booking
router.post('/', async (req, res) => {
    const {
        sellerId,
        consumerId,
        bookingDate,
        timeSlot,
        consumerEmail
    } = req.body;

    // Validate required fields
    const missing = [];
    if (!sellerId) missing.push("sellerId");
    if (!consumerId) missing.push("consumerId");
    if (!consumerEmail) missing.push("consumerEmail");
    if (!bookingDate) missing.push("bookingDate");
    if (!timeSlot) missing.push("timeSlot");

    if (missing.length) {
        return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
    }

    try {
        // const servicesCollection = getServiceCollection();
        const bookingsCollection = getBookingCollection(); // Assume this is defined

        // Fetch the service to extract details
        const service_res = await getServiceById(sellerId);
        if (!service_res) {
            return res.status(404).json({ message: "Service not found" });
        }

        const service = service_res.results[0]

        // Construct the booking entry
        const booking = {
            consumerId,
            consumerEmail,
            sellerId: service.sellerId,
            bookingDate: new Date(bookingDate),
            timeSlot,
            status: "requested",
            amount: service.price,
            currency: service.currency || "USD",
            payment: {
                status: "not_initiated",
                paymentIntentId: null,
                method: null,
                paidAt: null
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await bookingsCollection.insertOne(booking);
        res.status(201).json({ message: "Booking created", id: result.insertedId });
    } catch (err) {
        console.error("Error creating booking:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
