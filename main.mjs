import { Worker } from 'worker_threads';
import os from 'os';
import { exec } from 'child_process';

const numCPUs = os.cpus().length;
const totalPages = 50;
const pagesPerCPU = Math.ceil(totalPages / numCPUs);

// Function to run Python script for sentiment analysis
function runPythonScript() {
    exec('python sentiment_analysis.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return;
        }
        console.log(`Python stdout: ${stdout}`);
        console.log(`Python stderr: ${stderr}`);
    });
}

// Function to create and manage a worker
const createWorker = (scriptPath, startPage, endPage) => {
    const worker = new Worker(scriptPath, { workerData: { startPage, endPage } });

    worker.on('message', (message) => {
        console.log(`Message from worker handling pages ${startPage} to ${endPage}: ${message}`);
    });

    worker.on('error', (error) => {
        console.error(`Error from worker handling pages ${startPage} to ${endPage}: ${error}`);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.log(`Worker handling pages ${startPage} to ${endPage} stopped with exit code ${code}`);
        }
    });

    return new Promise((resolve) => {
        worker.on('exit', resolve);
    });
};

// Main function to coordinate workers
const main = async () => {
    // Create initial workers for collecting links
    const initialWorkers = [];
    for (let i = 0; i < numCPUs; i++) {
        const startPage = i * pagesPerCPU + 1;
        const endPage = Math.min((i + 1) * pagesPerCPU, totalPages);
        initialWorkers.push(createWorker('./worker.mjs', startPage, endPage));
    }

    // Wait for all initial workers to finish
    await Promise.all(initialWorkers);

    // Create new workers for forum scraping
    const forumScraperWorkers = [];
    for (let i = 0; i < numCPUs; i++) {
        const startPage = i * pagesPerCPU + 1;
        const endPage = Math.min((i + 1) * pagesPerCPU, totalPages);
        forumScraperWorkers.push(createWorker('./forumScraper.mjs', startPage, endPage));
    }

    // Wait for all forum scraper workers to finish
    await Promise.all(forumScraperWorkers);

    // Run Python script for sentiment analysis
    runPythonScript();
};

main().catch(err => {
    console.error('An error occurred:', err);
});


