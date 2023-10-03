// forumScraper.mjs
import puppeteer from 'puppeteer';
import { parentPort, workerData } from 'worker_threads';
import CSVBuilder from './csvBuilder.mjs';
import fs from 'fs';  // Core fs for createReadStream
import csv from 'csv-parser';
import path from 'path';

const { startPage, endPage } = workerData;

const scrapeForum = async (url) => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForFunction('window.location.href.includes("t")');

    const viewsSelector = 'div[c-cnx_avr_threadtopinfo_cnx_avr_threadtopinfo] b[c-cnx_avr_threadtopinfo_cnx_avr_threadtopinfo]';
    const allViews = await page.$$eval(viewsSelector, elements => elements.map(el => el.innerText));
    const views = allViews.find(view => !isNaN(view));

    const postContentSelector = 'div[c-cnx_avr_chronologicalthreadcomment_cnx_avr_chronologicalthreadcomment] p[c-cnx_avr_chronologicalthreadcomment_cnx_avr_chronologicalthreadcomment]';
    let postContents = await page.$$eval(postContentSelector, elements => elements.map(el => el.innerText).join('\n'));

    // Remove consecutive newlines
    postContents = postContents.replace(/\n\s*\n/g, '\n');

    await browser.close();
    return { views, postContents };
};

const readCSV = async (filename) => {
    const forumLinks = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)  // Using core fs here
            .pipe(csv())
            .on('data', (row) => {
                forumLinks.push(row['Topic Links']);
            })
            .on('end', () => {
                resolve(forumLinks);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

(async () => {
    try {
        const csvFile = path.join('csv_files', `topics_${startPage}_to_${endPage}.csv`);
        const forumLinks = await readCSV(csvFile);
        const csvBuilder = new CSVBuilder(['Forum URL', 'Views', 'Post Contents']);

        for (const url of forumLinks) {
            console.log(`Forum Scraper for pages ${startPage} to ${endPage} is now scraping URL ${url}`);
            const { views, postContents } = await scrapeForum(url);
            csvBuilder.addRow([url, views, postContents]);
        }

        const filePath = await csvBuilder.saveToFile(`forum_data_${startPage}_to_${endPage}.csv`);
        parentPort.postMessage(`CSV file for pages ${startPage} to ${endPage} saved at ${filePath}`);

    } catch (error) {
        parentPort.postMessage(`An error occurred: ${error.message}`);
    }
})();

