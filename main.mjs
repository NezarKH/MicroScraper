// main.mjs
import { Worker } from 'worker_threads';
import os from 'os';

const numCPUs = os.cpus().length;
const totalPages = 50;
const pagesPerCPU = Math.ceil(totalPages / numCPUs);

// Create initial workers for collecting links
const workers = [];
for (let i = 0; i < numCPUs; i++) {
    const startPage = i * pagesPerCPU + 1;
    const endPage = Math.min((i + 1) * pagesPerCPU, totalPages);
    const worker = new Worker('./worker.mjs', { workerData: { startPage, endPage } });
    workers.push(worker);

    worker.on('message', (message) => {
        console.log(`Worker message from worker handling pages ${startPage} to ${endPage}: ${message}`);
    });

    worker.on('error', (error) => {
        console.error(`Worker error from worker handling pages ${startPage} to ${endPage}: ${error}`);
    });

    worker.on('exit', (code) => {
        if (code !== 0) console.log(`Worker handling pages ${startPage} to ${endPage} stopped with exit code ${code}`);
    });
}

// Wait for all initial workers to finish
Promise.all(workers.map(worker => {
    return new Promise((resolve) => {
        worker.on('exit', resolve);
    });
})).then(() => {
    // Create new workers for forum scraping
    const forumScraperWorkers = [];
    for (let i = 0; i < numCPUs; i++) {
        const startPage = i * pagesPerCPU + 1;
        const endPage = Math.min((i + 1) * pagesPerCPU, totalPages);
        const forumScraperWorker = new Worker('./forumScraper.mjs', { workerData: { startPage, endPage } });
        forumScraperWorkers.push(forumScraperWorker);

        forumScraperWorker.on('message', (message) => {
            console.log(`Forum Scraper Worker message from worker handling pages ${startPage} to ${endPage}: ${message}`);
        });

        forumScraperWorker.on('error', (error) => {
            console.error(`Forum Scraper Worker error from worker handling pages ${startPage} to ${endPage}: ${error}`);
        });

        forumScraperWorker.on('exit', (code) => {
            if (code !== 0) console.log(`Forum Scraper Worker handling pages ${startPage} to ${endPage} stopped with exit code ${code}`);
        });
    }
});
