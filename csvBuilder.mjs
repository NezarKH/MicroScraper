//csvBuilder.mjs
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

class CSVBuilder {
    constructor(header) {
        this.rows = [];
        if (header) {
            this.addRow(header);
        }
    }

    // Function to escape special characters in CSV
    escapeCSV(value) {
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    addRow(row) {
        // Escape values in the row before adding it
        const escapedRow = row.map(this.escapeCSV);
        this.rows.push(escapedRow);
    }

    build() {
        // Convert rows to CSV string
        return this.rows.map(row => row.join(',')).join('\n');
    }

    async saveToFile(filename) {
        try {
            // Create a folder for CSV files if it doesn't exist
            const folderPath = path.join(__dirname, 'csv_files');
            try {
                await fs.access(folderPath);
            } catch (error) {
                await fs.mkdir(folderPath);
            }

            // Build the CSV content
            const csvContent = this.build();

            // Write the CSV content to a file inside the 'csv_files' folder
            const filePath = path.join(folderPath, filename);
            await fs.writeFile(filePath, csvContent);

            return filePath;
        } catch (err) {
            throw err;
        }
    }
}

export default CSVBuilder;
