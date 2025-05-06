from pymongo import MongoClient

# MongoDB connection string
mongo_uri = "mongodb+srv://ecommerce:ecommerce@mern-ecommerce.tfxhq.mongodb.net/mern-ecommerce"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["mern-ecommerce"]

# Check collections
print("Products count:", db.products.count_documents({}))
print("Orders count:", db.orders.count_documents({}))
print("Users count:", db.users.count_documents({}))