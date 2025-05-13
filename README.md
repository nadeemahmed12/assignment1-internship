# 🗓️ Sydney Events Scraper

A Node.js application that scrapes real-time events from [TimeOut Sydney](https://www.timeout.com/sydney/events), processes the data, and stores it in MongoDB. The application exposes an API to retrieve this information in structured JSON format.

---

## 🚀 Overview

This scraper is designed to collect and serve event information from TimeOut Sydney. While the initial vision included scraping multiple sources, due to technical limitations (JS-heavy rendering), the current stable version focuses on TimeOut Sydney and successfully extracts **47 events**.

---

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js  
- **Web Scraping:** Axios (for HTTP requests), Cheerio (for HTML parsing)  
- **Database:** MongoDB using Mongoose ODM  

---

## 🔄 Workflow

### 1. Scraping

- Scrapes data from: `https://www.timeout.com/sydney/events`
- Extracts:  
  - `title`  
  - `date`  
  - `location`  
  - `sourceUrl`  
  - `imageUrl`

### 2. Processing

- Dates are standardized via a custom `parseDate()` function
- Duplicate entries are filtered out

### 3. Storing

- Cleaned data is inserted into MongoDB

### 4. API Access

- API Endpoint: `GET /events`  
- Returns JSON array of all stored events

---

## 🧠 Challenges Faced

### 🔸 1. Dynamic Website Structure

- **Problem:** TimeOut’s HTML structure changes frequently  
- **Solution:** Used resilient and semantic selectors (e.g., `[data-testid="card-list-item"]`)

### 🔸 2. Date Parsing Issues

- **Problem:** Dates like `"4 June"` were hard to parse  
- **Solution:** Custom `parseDate()` function was written to handle multiple date formats

---

## 📌 Current Status

- ✅ Scraper fetches **47** real-time events from TimeOut Sydney
- ✅ Data is parsed, cleaned, and saved to MongoDB
- ✅ API is active and delivers structured results

---


## 📦 Sample API Output

```json
{
  "success": true,
  "message": "Found 47 events",
  "count": 47
}
