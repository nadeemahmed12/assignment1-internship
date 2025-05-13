const axios = require('axios');
const cheerio = require('cheerio');
const Event = require('../models/Event');

// Helper function to delay requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced date parser with multiple formats
const parseDate = (dateStr) => {
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  // Common date formats
  const formats = [
    { regex: /(\d{1,2})\s+(\w{3})\s+(\d{4})/, handler: ([, day, month, year]) =>
      new Date(year, months[month], day) }, // 15 Jan 2023
    { regex: /(\w{3})\s+(\d{1,2})\s+(\d{4})/, handler: ([, month, day, year]) =>
      new Date(year, months[month], day) }, // Jan 15 2023
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, handler: ([, day, month, year]) =>
      new Date(year, parseInt(month) - 1, day) }, // 15/01/2023
    { regex: /(\d{4})-(\d{2})-(\d{2})/, handler: ([, year, month, day]) =>
      new Date(year, parseInt(month) - 1, day) } // 2023-01-15
  ];

  for (const { regex, handler } of formats) {
    const match = dateStr.match(regex);
    if (match) return handler(match);
  }


  return new Date(); // Fallback
};

// Resilient scraping function with retries
const safeScrape = async (url, options = {}, retries = 3) => {
  try {
    await delay(2000); // Respectful delay
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      timeout: 10000,
      ...options.config
    });
    return response.data;
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying ${url} (${retries} left)...`);
      return safeScrape(url, options, retries - 1);
    }
    throw err;
  }
};

// Scrape TimeOut Sydney
const scrapeTimeoutSydney = async () => {
  try {
    const html = await safeScrape('https://www.timeout.com/sydney/events');
    if (!html) return [];

    const $ = cheerio.load(html);
    const events = [];

    $('[data-testid="card-list-item"], .event-card, article').each((i, el) => {
      const title = $(el).find('h3, h2').first().text().trim();
      const dateText = $(el).find('time, [data-testid="event-date"]').first().text().trim() || 'Soon';
      const location = $(el).find('[data-testid="venue-name"], .location').first().text().trim() || 'Sydney';
      const sourceUrl = $(el).find('a').first().attr('href');
      const imageUrl = $(el).find('img').first().attr('src');

      if (title) {
        events.push({
          title,
          date: parseDate(dateText),
          location,
          sourceUrl: sourceUrl?.startsWith('http') ? sourceUrl : `https://www.timeout.com${sourceUrl}`,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : undefined
        });
      }
    });

    return events;
  } catch (err) {
    console.log('TimeOut Sydney scraping failed:', err.message);
    return [];
  }
};

// Scrape Eventbrite
const scrapeEventbrite = async () => {
  try {
    const html = await safeScrape('https://www.eventbrite.com.au/d/australia--sydney/events/');
    if (!html) return [];

    const $ = cheerio.load(html);
    const events = [];

    $('[data-testid="event-card"], .event-card').each((i, el) => {
      const title = $(el).find('h2, h3, [data-testid="event-title"]').first().text().trim();
      const dateText = $(el).find('time, [data-testid="event-date"]').first().text().trim();
      const location = $(el).find('[data-testid="venue-name"], .venue').first().text().trim() || 'Sydney';
      const sourceUrl = $(el).find('a').first().attr('href');
      const imageUrl = $(el).find('img').first().attr('src');

      if (title && dateText) {
        events.push({
          title,
          date: parseDate(dateText),
          location,
          sourceUrl: sourceUrl?.startsWith('http') ? sourceUrl : `https://www.eventbrite.com.au${sourceUrl}`,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : undefined
        });
      }
    });

    return events;
  } catch (err) {
    console.log('Eventbrite scraping failed:', err.message);
    return [];
  }
};


// Main scraping function
const scrapeEvents = async () => {
  try {
    console.log('Starting event scraping at', new Date().toISOString());

    // Scrape all sources in parallel
    const [ timeoutEvents, eventbriteEvents,] = await Promise.all([
      scrapeTimeoutSydney(),
      scrapeEventbrite(),
    ]);

    // Combine all events
    let events = [
      ...timeoutEvents,
      ...eventbriteEvents,
    ];

    console.log(` ${timeoutEvents.length} from TimeOut, ${eventbriteEvents.length} from Eventbrite`);

    // Remove duplicates
    events = events.filter((event, index, self) =>
      index === self.findIndex(e =>
        e.title === event.title &&
        e.date.getTime() === event.date.getTime() &&
        e.location === event.location
      )
    );

    // Save to database
    await Event.deleteMany({});
    const result = await Event.insertMany(events);
    console.log(`Saved ${result.length} events to database at ${new Date().toISOString()}`);
    return result.length;

  } catch (err) {
    console.error('Scraping error:', err);
    throw err;
  }
};

module.exports = { scrapeEvents };