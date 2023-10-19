// forumScraper.mjs
import puppeteer from 'puppeteer';
import { parentPort, workerData } from 'worker_threads';
import CSVBuilder from './csvBuilder.mjs';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const { startPage, endPage } = workerData;

const scrapeForum = async (page, url) => {
    await page.goto(url, { waitUntil: 'networkidle2' });

    const viewsSelector = 'div[c-cnx_avr_threadtopinfo_cnx_avr_threadtopinfo] b[c-cnx_avr_threadtopinfo_cnx_avr_threadtopinfo]';
    const allViews = await page.$$eval(viewsSelector, elements => elements.map(el => el.innerText));
    const views = allViews.find(view => !isNaN(view));

    const postContainers = await page.$x("//div[@data-key]");
    const scrapeData = await Promise.all(postContainers.map(async (container) => {
        const [usernameElement] = await container.$x(".//div[contains(@class, 'username-text')]");
        const [userTypeElement] = await container.$x(".//div[contains(@class, 'subti-muted')][contains(text(), 'Level')]");
        const [postContentElement] = await container.$x(".//div[@class='contain-post slds-rich-text-editor__output']");

        const username = usernameElement ? await page.evaluate(el => el.innerText, usernameElement) : '';
        const userType = userTypeElement ? await page.evaluate(el => el.innerText, userTypeElement) : '';
        const postContent = postContentElement ? await page.evaluate(el => el.innerText, postContentElement) : '';

        return { username, userType, postContent };
    }));

    return { views, scrapeData };
};

const readCSV = async (filename) => {
    const forumLinks = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
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
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        const csvFile = path.join('csv_files', `topics_${startPage}_to_${endPage}.csv`);
        const forumLinks = await readCSV(csvFile);
        const csvBuilder = new CSVBuilder(['Forum URL', 'Views', 'Username', 'User Type', 'Post Content']);

        for (const url of forumLinks) {
            console.log(`Forum Scraper for pages ${startPage} to ${endPage} is now scraping URL ${url}`);
            const { views, scrapeData } = await scrapeForum(page, url);
            scrapeData.forEach(({ username, userType, postContent }) => {
                csvBuilder.addRow([url, views, username, userType, postContent]);
            });
        }

        await browser.close();

        const filePath = await csvBuilder.saveToFile(`forum_data_${startPage}_to_${endPage}.csv`);
        parentPort.postMessage(`CSV file for pages ${startPage} to ${endPage} saved at ${filePath}`);
    } catch (error) {
        parentPort.postMessage(`An error occurred: ${error.message}`);
    }
})();
