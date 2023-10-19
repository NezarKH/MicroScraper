import os
import pandas as pd
import openai

# Load API key
os.environ["OPENAI_API_KEY"] = ""

def read_csv_files(directory_path):
    data_frames = []
    for filename in os.listdir(directory_path):
        if filename.startswith('sentiment_forum_data_') and filename.endswith('.csv'):
            filepath = os.path.join(directory_path, filename)
            df = pd.read_csv(filepath)
            data_frames.append(df)

    return pd.concat(data_frames, ignore_index=True)

def generate_faq_questions(text):
    faq_questions = []
    try:
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=f"Generate an FAQ question based on the following negative post:\n\n{text}",
            max_tokens=10,
        )
        faq_questions.append(response.choices[0].text.strip())
    except Exception as e:
        print(f"An error occurred: {e}")

    return faq_questions

def main():
    input_directory = 'csv_files_with_sentiment'
    output_directory = 'csv_files_with_faq'

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    df = read_csv_files(input_directory)
    df_negative = df[df['Sentiment Category'] == 'Negative'].sort_values(by='Polarity')
    questions_frequency = {}

    # Limit to first 100 most negative posts for efficiency
    for _, row in df_negative.head(100).iterrows():
        faq_questions = generate_faq_questions(row['Post Content'])
        for question in faq_questions:
            questions_frequency[question] = questions_frequency.get(question, 0) + 1

    top_100_questions = sorted(questions_frequency, key=questions_frequency.get, reverse=True)[:100]
    df_top_100 = pd.DataFrame(top_100_questions, columns=["Top 100 Negative FAQ Questions"])

    top_100_filepath = os.path.join(output_directory, "top_100_negative_faq_questions.csv")
    df_top_100.to_csv(top_100_filepath, index=False)
    print(f"Top 100 negative FAQ questions saved to {top_100_filepath}")

if __name__ == '__main__':
    main()
