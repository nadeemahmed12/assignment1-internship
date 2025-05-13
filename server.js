// Add this before any other code
const crypto = require('crypto');
global.crypto = crypto;
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cron = require('node-cron');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//eventRoutes
app.use('/api', require('./routes/eventRoutes'));

//scrapeRoutes
app.use('/api/scrape', require('./routes/scrapeRoutes'));

// Main route
app.get('/', async (req, res) => {
  try {
    const events = await require('./models/Event').find().sort({ date: 1 });
    res.render('index', { events });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Schedule scraping daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Running daily event scrape...');
  try {
    const count = await scrapeTimeOutSydney();
    console.log(`Scraped ${count} events`);
  } catch (err) {
    console.error('Scraping failed:', err);
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));