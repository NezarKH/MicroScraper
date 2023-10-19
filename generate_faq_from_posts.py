import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# List of relevant words in the context of software development or programming
RELEVANT_WORDS = [
    'code', 'config', 'debug', 'data', 'file', 'security', 'performance', 'test', 'function', 'class',
    'object', 'library', 'framework', 'database', 'algorithm', 'api', 'server', 'client', 'loop',
    'array', 'list', 'string', 'integer', 'boolean', 'variable', 'constant', 'parameter', 'argument'
]

# Question templates for generating more diverse questions
QUESTION_TEMPLATES = [
    "What steps should I take to optimize my code when working with {word}?",
    "What are the best practices for {word} configuration?",
    "How do I troubleshoot issues when using {word}?",
    "Can you explain the significance of {word} in programming?",
    "What is the role of {word} in code compilation?",
    "How should I use {word} effectively?",
    "What are the security considerations when handling {word}?",
    "How is {word} different from other similar concepts?",
    "What are some common pitfalls when working with {word}?",
    "How do I convert {word} to a different format?"
]


def is_relevant_question(word):
    return word.lower() in RELEVANT_WORDS


def load_and_combine_csv(directory_path):
    data_frames = [
        pd.read_csv(os.path.join(directory_path, f))
        for f in os.listdir(directory_path) if f.startswith('sentiment_forum_data_') and f.endswith('.csv')
    ]
    return pd.concat(data_frames, ignore_index=True)


def analyze_text(df, vectorizer):
    return vectorizer.fit_transform(df['Post Content'])


def generate_and_evaluate_questions(tfidf_matrix, features, df, vectorizer):
    questions = []
    relevance_scores = []

    for word in features:
        if is_relevant_question(word):
            generated_questions = [template.format(word=word) for template in QUESTION_TEMPLATES]

            for q in generated_questions:
                new_tfidf = vectorizer.transform([q] + df['Post Content'].tolist())
                cosine_sim = cosine_similarity(new_tfidf[0:1], new_tfidf[1:])
                relevance_scores.append(np.mean(cosine_sim))

            questions.extend(generated_questions)

    question_data = pd.DataFrame({
        'Question': questions,
        'Relevance Score': relevance_scores
    })

    return question_data.sort_values(by='Relevance Score', ascending=False).head(100)


def save_to_csv(df, output_file_path):
    df.to_csv(output_file_path, index=False)


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.join(script_dir, "csv_files_with_sentiment")

    # Load data and clean it
    df = load_and_combine_csv(base_dir)
    df.dropna(subset=['Post Content'], inplace=True)

    # Initialize vectorizer
    tfidf_vectorizer = TfidfVectorizer(max_features=50, stop_words='english')

    # Analyze text and get features
    tfidf_matrix = analyze_text(df, tfidf_vectorizer)
    features = tfidf_vectorizer.get_feature_names_out()

    # Generate and evaluate questions
    generated_questions_df = generate_and_evaluate_questions(tfidf_matrix, features, df, tfidf_vectorizer)

    # Save to CSV
    output_dir = os.path.join(script_dir, "csv_files_with_faq")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    output_file_path = os.path.join(output_dir, 'generated_faq_questions.csv')
    save_to_csv(generated_questions_df, output_file_path)

    print(f"Generated FAQ questions saved to {output_file_path}")
