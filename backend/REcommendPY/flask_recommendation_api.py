"""
Recommendation System API
-----------------------
Flask API to serve product recommendations
"""

from flask import Flask, jsonify, request
import os
import pandas as pd
import json

# Import the recommendation system
from recommendation_system import RecommendationSystem

app = Flask(__name__)

# Initialize recommendation system
recommender = RecommendationSystem(data_dir='data')

@app.before_first_request
def initialize():
    """Initialize the recommendation system before first request"""
    try:
        # Load data
        recommender.load_data()
        
        # Calculate popularity scores
        recommender.calculate_popularity_scores()
        
        # Create user-item matrix for personalized recommendations
        recommender.create_user_item_matrix()
        
        print("Recommendation system initialized successfully")
    except Exception as e:
        print(f"Error initializing recommendation system: {e}")

@app.route('/api/recommendations/popular', methods=['GET'])
def popular_recommendations():
    """Get popular product recommendations"""
    try:
        count = request.args.get('count', 5, type=int)
        recommendations = recommender.get_popular_recommendations(count)
        return jsonify({
            'status': 'success',
            'count': len(recommendations),
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/recommendations/category/<category>', methods=['GET'])
def category_recommendations(category):
    """Get recommendations for a specific category"""
    try:
        count = request.args.get('count', 5, type=int)
        recommendations = recommender.get_category_recommendations(category, count)
        
        if not recommendations:
            return jsonify({
                'status': 'warning',
                'message': f'No products found in category: {category}',
                'recommendations': []
            }), 200
            
        return jsonify({
            'status': 'success',
            'category': category,
            'count': len(recommendations),
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/recommendations/price-range', methods=['GET'])
def price_range_recommendations():
    """Get recommendations for a specific price range"""
    try:
        min_price = request.args.get('min', 0, type=float)
        max_price = request.args.get('max', float('inf'), type=float)
        count = request.args.get('count', 5, type=int)
        
        recommendations = recommender.get_price_range_recommendations(min_price, max_price, count)
        
        return jsonify({
            'status': 'success',
            'price_range': {'min': min_price, 'max': max_price if max_price != float('inf') else 'unlimited'},
            'count': len(recommendations),
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/recommendations/user/<user_id>', methods=['GET'])
def user_recommendations(user_id):
    """Get personalized recommendations for a specific user"""
    try:
        count = request.args.get('count', 5, type=int)
        recommendations = recommender.get_user_recommendations(user_id, count)
        
        return jsonify({
            'status': 'success',
            'user_id': user_id,
            'count': len(recommendations),
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get list of all product categories"""
    try:
        categories = recommender.products_df['category'].unique().tolist()
        return jsonify({
            'status': 'success',
            'count': len(categories),
            'categories': categories
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get basic statistics about the recommendation system data"""
    try:
        # Get top categories by product count
        category_counts = recommender.products_df['category'].value_counts().head(5).to_dict()
        
        # Get price range distribution
        price_ranges = {
            'budget (0-25)': len(recommender.products_df[recommender.products_df['price'] <= 25]),
            'mid-range (25-75)': len(recommender.products_df[(recommender.products_df['price'] > 25) & (recommender.products_df['price'] <= 75)]),
            'premium (75+)': len(recommender.products_df[recommender.products_df['price'] > 75])
        }
        
        # Get top selling products
        top_sellers = recommender.get_popular_recommendations(5)
        
        return jsonify({
            'status': 'success',
            'product_count': len(recommender.products_df),
            'order_count': len(recommender.orders_df),
            'user_count': len(recommender.users_df),
            'category_distribution': category_counts,
            'price_range_distribution': price_ranges,
            'top_selling_products': top_sellers
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """API welcome page"""
    return jsonify({
        'message': 'Welcome to the Product Recommendation API',
        'endpoints': {
            'Popular Recommendations': '/api/recommendations/popular?count=5',
            'Category Recommendations': '/api/recommendations/category/{category_name}?count=5',
            'Price Range Recommendations': '/api/recommendations/price-range?min=0&max=100&count=5',
            'User Recommendations': '/api/recommendations/user/{user_id}?count=5',
            'Categories List': '/api/categories',
            'System Statistics': '/api/stats'
        }
    })

if __name__ == '__main__':
    # Use host 0.0.0.0 to make the server publicly available
    app.run(debug=True, host='0.0.0.0', port=5001)