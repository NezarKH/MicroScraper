Forum Scraper and Analyzer

Overview

This project is designed to scrape and analyze forum data. It utilizes a combination of Node.js and Python and leverages Puppeteer for web scraping. The project employs a multi-threaded approach to improve efficiency by parallelizing tasks across available CPU cores. It also includes machine learning algorithms for text analysis, such as sentiment analysis and FAQ generation.

Features

- Multi-threaded scraping: Utilizes all available CPU cores for concurrent scraping.
- Modular Design: Each part of the scraper is implemented in separate modules for easy maintenance and extensibility.
- Data Analysis: Includes sentiment analysis and FAQ generation.
- CSV Output: The scraped data is stored in CSV files for further analysis or use.

Modules

Main Modules

main.mjs

This is the main driver script that initiates and manages worker threads for scraping.

Important Functions:
- Worker(): Initializes new worker threads.
- Promise.all(): Waits for all worker threads to complete.

worker.mjs

Handles the scraping of various forum pages, including profile, sub-forum, and topic links.

Important Functions:
- puppeteer.launch(): Launches a browser window for scraping.
- page.goto(): Navigates to the specific forum page.

forumScraper.mjs

Responsible for scraping specific data such as views and post contents from individual forum threads.

Important Functions:
- readCSV(): Reads forum links from a CSV file.
- scrapeForum(): Scrapes data like views and posts.

csvBuilder.mjs

A utility module for creating and saving CSV files efficiently.

Important Functions:
- addRow(): Adds a new row to the CSV.
- build(): Constructs the CSV content.
- saveToFile(): Saves the CSV to a file.

Additional Python Modules

generate_faq_from_posts.py

Generates FAQs from scraped forum posts.

static_micro_crawl.py

Scrapes and analyzes text from static websites.

sentiment_analysis.py

Performs sentiment analysis on scraped data. (File could not be read for further details)

Setup & Running

1. Clone the repository.
2. Run npm install for Node.js dependencies.
3. Optional: Set up a Python environment and install Python dependencies.
4. Run node main.mjs to start the Node.js scraper.
5. For Python modules, run the respective Python scripts.

Logging

- Detailed logging is implemented to monitor the scraping and analysis processes.
- Each log message specifies which pages are currently being scraped, making it easier to debug and understand the project's status.

Dependencies

- Node.js
- Puppeteer
- csv-parser
- Python 3.x
- Various Python libraries for data analysis

Author

Khabiry
