# Forum Scraper

## Overview

This project is designed to scrape forum data from a website using Puppeteer and Node.js. It employs a multi-threaded approach to improve efficiency by parallelizing tasks across available CPU cores.

## Features

- **Multi-threaded scraping**: Utilizes all available CPU cores for concurrent scraping.
- **Modular Design**: Each part of the scraper is implemented in separate modules for easy maintenance and extensibility.
- **CSV Output**: The scraped data is stored in CSV files for further analysis or use.

## Modules

### main.mjs

This is the main driver script that initiates and manages worker threads for scraping.

#### Important Functions:

- `Worker()`: Creates a new Worker thread.
- `Promise.all()`: Waits for all worker threads to complete their tasks.

### worker.mjs

This module is responsible for scraping profile, sub-forum, and topic links from forum pages.

#### Important Functions:

- `puppeteer.launch()`: Launches a new browser window.
- `page.goto()`: Navigates to a specified URL.

### forumScraper.mjs

This module is responsible for scraping specific data such as views and post contents from individual forum threads.

#### Important Functions:

- `readCSV()`: Reads forum links from a CSV file.
- `scrapeForum()`: Scrapes forum data like views and posts.

### csvBuilder.mjs

A utility class for building and saving CSV files.

#### Important Functions:

- `addRow()`: Adds a new row to the CSV.
- `build()`: Builds the CSV content.
- `saveToFile()`: Saves the CSV content to a file.

## Setup & Running

1. Clone this repository.
2. Run `npm install` to install all dependencies.
3. Run `node main.mjs` to start the scraper.

## Logging

- Logging is implemented to monitor the progress and state of each worker thread.
- Each log message specifies which pages are currently being scraped by a worker, making it easier to debug and understand what the scraper is doing at any given moment.

## Dependencies

- Node.js
- Puppeteer
- csv-parser
- worker_threads (Node.js core module)

## Author

Khabiry

---
