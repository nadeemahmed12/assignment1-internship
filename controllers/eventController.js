const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.handleGetTickets = async (req, res) => {
  try {
    const { eventId, email } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.redirect(event.sourceUrl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};