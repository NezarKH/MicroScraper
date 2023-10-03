// worker.mjs
import puppeteer from 'puppeteer';
import CSVBuilder from './csvBuilder.mjs';
import { parentPort, workerData } from 'worker_threads';

const { startPage, endPage } = workerData;

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Arrays to hold various types of links
        const profileLinks = [];
        const subForumLinks = [];
        const topicLinks = [];

        // Loop through each page range assigned to this worker
        for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
            console.log(`Worker handling pages ${startPage} to ${endPage} is now scraping page ${pageNumber}`);

            const offset = (pageNumber - 1) * 25;
            const url = `https://forum.microchip.com/s/?&page=${pageNumber}&offset=${offset}&filters=false&selectedlist=section1&followingtopics=false&myforums=false&myactivity=false`;

            await page.goto(url);
            await page.waitForSelector('a[c-cnx_microchip_posthometable2_cnx_microchip_posthometable2]');

            const elements = await page.$$('a[c-cnx_microchip_posthometable2_cnx_microchip_posthometable2]');

            // Collect different types of links based on their href attribute
            for (const element of elements) {
                const href = await page.evaluate(el => el.getAttribute('href'), element);

                if (href) {
                    const fullUrl = `https://forum.microchip.com${href}`;

                    if (href.startsWith('/s/user-profile')) {
                        profileLinks.push(fullUrl);
                    } else if (href.startsWith('/s/sub-forums')) {
                        subForumLinks.push(fullUrl);
                    } else if (href.startsWith('/s/topic')) {
                        topicLinks.push(fullUrl);
                    }
                }
            }
        }

        // Create CSV files for each type of link
        const csvBuilderProfiles = new CSVBuilder(['Profile Links']);
        profileLinks.forEach(link => csvBuilderProfiles.addRow([link]));

        const csvBuilderSubForums = new CSVBuilder(['SubForum Links']);
        subForumLinks.forEach(link => csvBuilderSubForums.addRow([link]));

        const csvBuilderTopics = new CSVBuilder(['Topic Links']);
        topicLinks.forEach(link => csvBuilderTopics.addRow([link]));

        // Save CSV files and get their paths
        const [profilePath, subForumPath, topicPath] = await Promise.all([
            csvBuilderProfiles.saveToFile(`profiles_${startPage}_to_${endPage}.csv`),
            csvBuilderSubForums.saveToFile(`subForums_${startPage}_to_${endPage}.csv`),
            csvBuilderTopics.saveToFile(`topics_${startPage}_to_${endPage}.csv`)
        ]);

        // Notify the parent thread about the saved files
        parentPort.postMessage(`CSV files for pages ${startPage} to ${endPage} saved at ${profilePath}, ${subForumPath}, and ${topicPath}`);

        await browser.close();
    } catch (error) {
        parentPort.postMessage(`An error occurred: ${error.message}`);
    }
})();
