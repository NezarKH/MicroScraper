import re
import requests
from bs4 import BeautifulSoup


# Scrape website and get all text
def scrape_website(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to get the web page: {url}")
        return None
    soup = BeautifulSoup(response.content, 'html.parser')
    scraped_data = []
    for element in soup.stripped_strings:
        scraped_data.append(element)
    return scraped_data


# Filter out lines that are likely to be complete sentences
def filter_complete_sentences(data):
    return [sentence.strip() for sentence in data if re.match(r'^[A-Z].*[.!?]$', sentence.strip())]


# Categorize sentences based on keywords
def categorize_sentences(sentences):
    categories = {
        'IoT': [],
        'Power': [],
        'Management': [],
        'Conversion': []
    }
    for sentence in sentences:
        for keyword in categories.keys():
            if keyword.lower() in sentence.lower():
                categories[keyword].append(sentence)
    return categories


# Save data to a text file
def save_data(file_name, data):
    with open(file_name, "w", encoding='utf-8') as f:
        for item in data:
            f.write(f"{item}\n")


if __name__ == "__main__":
    urls = [
        "https://www.microchip.com/en-us/solutions/internet-of-things",
        "https://www.microchip.com/en-us/solutions/power-management-and-conversion"
    ]

    for url in urls:
        data = scrape_website(url)
        if data is not None:
            # Save raw scraped data
            raw_file_name = f"raw_{url.split('/')[-1]}.txt"
            save_data(raw_file_name, data)

            # Filter the data to keep only complete sentences
            sentences = filter_complete_sentences(data)

            # Categorize the sentences
            categorized_data = categorize_sentences(sentences)

            # Save the categorized data to a text file
            cat_file_name = f"categorized_{url.split('/')[-1]}.txt"
            save_data(cat_file_name, [f"{k}: {', '.join(v)}" for k, v in categorized_data.items()])

            print(f"Scraped, categorized, and saved data from {url}.")
        else:
            print(f"Failed to scrape data from {url}")
