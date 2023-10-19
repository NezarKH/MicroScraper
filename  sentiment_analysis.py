import os
import pandas as pd
from textblob import TextBlob


def read_csv_files(directory_path):
    data_frames = []
    for filename in os.listdir(directory_path):
        if filename.startswith('forum_data_') and filename.endswith('.csv'):
            filepath = os.path.join(directory_path, filename)
            df = pd.read_csv(filepath)
            data_frames.append(df)
    return pd.concat(data_frames, ignore_index=True)


def perform_sentiment_analysis(text):
    analysis = TextBlob(str(text))
    return analysis.sentiment.polarity, analysis.sentiment.subjectivity


def categorize_sentiment(polarity):
    if polarity > 0:
        return 'Positive'
    elif polarity < 0:
        return 'Negative'
    else:
        return 'Neutral'


def main():
    input_directory = 'csv_files'
    output_directory = 'csv_files_with_sentiment'

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    df = read_csv_files(input_directory)

    if 'Post Content' not in df.columns:
        print(f"DataFrame columns: {df.columns}")
        raise KeyError("The DataFrame does not have a 'Post Content' column.")

    df['Polarity'], df['Subjectivity'] = zip(*df['Post Content'].map(perform_sentiment_analysis))

    df['Sentiment Category'] = df['Polarity'].map(categorize_sentiment)

    for filename in os.listdir(input_directory):
        if filename.startswith('forum_data_') and filename.endswith('.csv'):
            input_filepath = os.path.join(input_directory, filename)
            output_filepath = os.path.join(output_directory, f"sentiment_{filename}")

            original_df = pd.read_csv(input_filepath)

            if 'Forum URL' in df.columns and 'Forum URL' in original_df.columns:
                filtered_df = df[df['Forum URL'].isin(original_df['Forum URL'])]
            else:
                print(f"Skipping filtering for {filename} as 'Forum URL' column is missing.")
                filtered_df = df

            filtered_df.to_csv(output_filepath, index=False)


if __name__ == '__main__':
    main()
