const express = require('express');
const router = express.Router();
const { scrapeEvents } = require('../controllers/scrapeController');

//router.get('/scrape-now', scrapeController.scrapeEvents);

// Update the scrape-now endpoint
router.get('/scrape-now', async (req, res) => {
    try {
      const count = await scrapeEvents();
      res.json({
        success: true,
        message: `Found ${count} events`,
        count
      });
    } catch (err) {
      console.error('Final scraping error:', err);
      res.status(500).json({
        success: false,
        error: 'Scraping failed',
        details: 'The system will use sample events instead'
      });
    }
  });



module.exports = router;