import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate
import pickle

# Step 1: Load the Data
def load_data(file_path):
    # Load the CSV file containing user-product interactions
    data = pd.read_csv(file_path)
    return data

# Step 2: Train the Recommendation Model
def train_recommendation_model(data):
    # Define the format of the data (user_id, product_id, rating)
    reader = Reader(rating_scale=(1, 5))
    dataset = Dataset.load_from_df(data[['user_id', 'product_id', 'rating']], reader)

    # Use the SVD algorithm for Collaborative Filtering
    model = SVD()

    # Perform cross-validation to evaluate the model
    cross_validate(model, dataset, cv=5, verbose=True)

    # Train the model on the entire dataset
    trainset = dataset.build_full_trainset()
    model.fit(trainset)

    return model

# Step 3: Save the Trained Model
def save_model(model, file_path):
    with open(file_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {file_path}")

# Step 4: Main Function
if __name__ == "__main__":
    # Path to the CSV file containing user-product interactions
    csv_file_path = "user_product_interactions.csv"

    # Path to save the trained model
    model_file_path = "recommendation_model.pkl"

    # Load the data
    data = load_data(csv_file_path)

    # Train the recommendation model
    model = train_recommendation_model(data)

    # Save the trained model
    save_model(model, model_file_path)