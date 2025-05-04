"""
MongoDB Data Export Script (Python)
-----------------------------------
This script exports product and order data from MongoDB to CSV files
for use in recommendation systems.
"""

import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

class MongoDBExporter:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGO_URI')
        self.client = None
        self.db = None
        self.output_dir = 'data'

    def connect_to_db(self):
            """Connect to MongoDB database"""
            try:
                self.client = MongoClient(self.mongo_uri)
                # Explicitly set the database name
                self.db = self.client["mern-ecommerce"]
                logging.info("Connected to MongoDB successfully")
            except Exception as e:
                logging.error(f"Error connecting to MongoDB: {e}")
                raise

    def disconnect_from_db(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logging.info("Disconnected from MongoDB")

    def create_output_directory(self):
        """Create output directory if it doesn't exist"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            logging.info(f"Created output directory: {self.output_dir}")

    def export_products(self):
        """Export products collection to CSV"""
        try:
            # Fetch all products
            products = list(self.db.products.find())

            # Process products for CSV export
            processed_products = [
                {
                    'product_id': str(product['_id']),
                    'name': product.get('name', ''),
                    'description': product.get('description', ''),
                    'price': product.get('price', 0),
                    'category': product.get('category', ''),
                    'image': product.get('image', ''),
                    'isFeatured': product.get('isFeatured', False),
                    'createdAt': product.get('createdAt', ''),
                    'updatedAt': product.get('updatedAt', '')
                }
                for product in products
            ]

            # Create DataFrame and export to CSV
            products_df = pd.DataFrame(processed_products)
            products_csv_path = os.path.join(self.output_dir, 'products.csv')
            products_df.to_csv(products_csv_path, index=False)
            logging.info(f"Exported {len(products_df)} products to {products_csv_path}")

            return products_df
        except Exception as e:
            logging.error(f"Error exporting products: {e}")
            raise

    def export_orders(self):
        """Export order items collection to CSV"""
        try:
            # Fetch all orders
            orders = list(self.db.orders.find())

            # Process orders for CSV export (one row per product in each order)
            order_items = []
            for order in orders:
                user_id = str(order.get('user', ''))
                order_id = str(order['_id'])
                created_at = order.get('createdAt', '')

                if 'products' in order and isinstance(order['products'], list):
                    for item in order['products']:
                        if 'product' in item and 'quantity' in item:
                            order_items.append({
                                'order_id': order_id,
                                'user_id': user_id,
                                'product_id': str(item['product']),
                                'quantity': item.get('quantity', 0),
                                'price': item.get('price', 0),
                                'created_at': created_at
                            })

            # Create DataFrame and export to CSV
            orders_df = pd.DataFrame(order_items)
            orders_csv_path = os.path.join(self.output_dir, 'order_items.csv')
            orders_df.to_csv(orders_csv_path, index=False)
            logging.info(f"Exported {len(orders_df)} order items to {orders_csv_path}")

            # Optionally export a summary of orders as well
            order_summary = [
                {
                    'order_id': str(order['_id']),
                    'user_id': str(order.get('user', '')),
                    'total_amount': order.get('totalAmount', 0),
                    'stripe_session_id': order.get('stripeSessionId', ''),
                    'created_at': order.get('createdAt', ''),
                    'updated_at': order.get('updatedAt', '')
                }
                for order in orders
            ]
            orders_summary_df = pd.DataFrame(order_summary)
            orders_summary_csv_path = os.path.join(self.output_dir, 'orders.csv')
            orders_summary_df.to_csv(orders_summary_csv_path, index=False)
            logging.info(f"Exported {len(orders_summary_df)} orders to {orders_summary_csv_path}")

            return orders_df
        except Exception as e:
            logging.error(f"Error exporting orders: {e}")
            raise

    def export_users(self):
        """Export users collection to CSV (with sensitive data removed)"""
        try:
            # Fetch all users
            users = list(self.db.users.find())

            # Process users for CSV export (excluding sensitive data)
            processed_users = [
                {
                    'user_id': str(user['_id']),
                    'name': user.get('name', ''),
                    'role': user.get('role', 'customer'),
                    'cart_items_count': len(user.get('cartItems', [])),
                    'created_at': user.get('createdAt', ''),
                    'updated_at': user.get('updatedAt', '')
                }
                for user in users
            ]

            # Create DataFrame and export to CSV
            users_df = pd.DataFrame(processed_users)
            users_csv_path = os.path.join(self.output_dir, 'users.csv')
            users_df.to_csv(users_csv_path, index=False)
            logging.info(f"Exported {len(users_df)} users to {users_csv_path}")

            return users_df
        except Exception as e:
            logging.error(f"Error exporting users: {e}")
            raise

    def export_popularity_data(self):
        """Export product popularity data to CSV based on order items"""
        try:
            order_items_csv_path = os.path.join(self.output_dir, 'order_items.csv')
            products_csv_path = os.path.join(self.output_dir, 'products.csv')

            if not os.path.exists(order_items_csv_path) or not os.path.exists(products_csv_path):
                logging.error("Error: order_items.csv or products.csv not found. Run export_orders and export_products first.")
                return None

            orders_df = pd.read_csv(order_items_csv_path)
            products_df = pd.read_csv(products_csv_path)

            # Calculate product purchase counts
            popularity_df = orders_df.groupby('product_id')['quantity'].sum().reset_index()
            popularity_df.columns = ['product_id', 'purchase_count']

            # Merge product details with popularity data
            merged_df = pd.merge(products_df[['product_id', 'name', 'image']], popularity_df, on='product_id', how='left')
            merged_df['purchase_count'] = merged_df['purchase_count'].fillna(0).astype(int)

            # Sort by purchase count
            merged_df_sorted = merged_df.sort_values('purchase_count', ascending=False)

            # Export to CSV
            popularity_csv_path = os.path.join(self.output_dir, 'product_popularity.csv')
            merged_df_sorted.to_csv(popularity_csv_path, index=False)
            logging.info(f"Exported product popularity data to {popularity_csv_path}")

            return merged_df_sorted
        except FileNotFoundError as e:
            logging.error(f"Error: {e}")
            return None
        except Exception as e:
            logging.error(f"Error exporting popularity data: {e}")
            return None

    def run_export(self):
        """Run the full export process"""
        try:
            self.connect_to_db()
            self.create_output_directory()

            # Export collections
            self.export_products()
            self.export_orders()
            self.export_users()

            # Generate derived data
            self.export_popularity_data()

            logging.info("Export completed successfully!")
        except Exception as e:
            logging.error(f"Export failed: {e}")
        finally:
            self.disconnect_from_db()

if __name__ == "__main__":
    exporter = MongoDBExporter()
    exporter.run_export()