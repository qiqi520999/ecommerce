import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
	try {
		const products = await Product.find({}); // find all products
		res.json({ products });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");

		if (featuredProducts) {
			try {
				featuredProducts = JSON.parse(featuredProducts);
				return res.json({ success: true, data: featuredProducts });
			} catch (parseError) {
				console.error("Error parsing featured products from Redis:", parseError.message);
			}
		}

		// Fetch from MongoDB
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts || featuredProducts.length === 0) {
			return res.json({ success: true, data: [] });
		}

		// Save to Redis
		await redis.set("featured_products", JSON.stringify(featuredProducts));

		res.json({ success: true, data: featuredProducts });
	} catch (error) {
		console.error("Error in getFeaturedProducts controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category } = req.body;

		// Validate required fields
		if (!name || !description || !price || !image || !category) {
			return res.status(400).json({ 
				message: "All fields are required",
				error: "Missing required fields"
			});
		}

		// Validate price is a positive number
		if (isNaN(price) || price <= 0) {
			return res.status(400).json({
				message: "Price must be a positive number",
				error: "Invalid price"
			});
		}

		let cloudinaryResponse = null;

		try {
			if (image) {
				cloudinaryResponse = await cloudinary.uploader.upload(image, { 
					folder: "products",
					resource_type: "auto"
				});
			}
		} catch (uploadError) {
			console.error("Error uploading to Cloudinary:", uploadError);
			return res.status(500).json({ 
				message: "Error uploading image",
				error: uploadError.message
			});
		}

		const product = await Product.create({
			name,
			description,
			price: Number(price),
			image: cloudinaryResponse?.secure_url || image,
			category,
			isFeatured: false
		});

		res.status(201).json({
			success: true,
			data: product
		});
	} catch (error) {
		console.error("Error in createProduct controller:", error);
		res.status(500).json({ 
			message: "Error creating product",
			error: error.message
		});
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloduinary");
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updateFeaturedProductsCache() {
	try {
		// The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

		const featuredProducts = await Product.find({ isFeatured: true }).lean();
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		console.log("error in update cache function");
	}
}
