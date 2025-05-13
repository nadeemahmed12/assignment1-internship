const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/events', eventController.getAllEvents);
router.post('/get-tickets', eventController.handleGetTickets);

module.exports = router;