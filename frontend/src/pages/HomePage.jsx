import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import BannerProduct from "../components/BannerProduct";
import ProductCard from "../components/ProductCard";

const categories = [
    { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
    { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
    { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
    { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
    { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
    { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
    { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];



const HomePage = () => {
    const { fetchFeaturedProducts, fetchAllProducts, products, loading } = useProductStore();
    const [allProducts, setAllProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const { category } = useParams();

    // Fetch featured products
    useEffect(() => {
        const getFeaturedProducts = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/products/featured");
                const data = await response.json();
                setFeaturedProducts(data.data || []);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            }
        };
        getFeaturedProducts();
    }, []);

    // Fetch all products
    useEffect(() => {
        const getAllProducts = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/products");
                const data = await response.json();
                setAllProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching all products:", error);
            }
        };
        getAllProducts();
    }, []);

    console.log("allProducts:", allProducts);
    console.log("featuredProducts:", featuredProducts);

    return (
        <div className="relative min-h-screen text-white overflow-hidden">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Categories Section */}
                <div className="container mx-auto p-4">
                    <div className="flex items-center gap-4 justify-between overflow-x-auto scrollbar-none">
                        {categories.map((category) => (
                            <CategoryItem category={category} key={category.name} />
                        ))}
                    </div>
                </div>

                {/* Banner Section */}
                <BannerProduct />

                {/* Products Section */}
				<h1 className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8">All Products</h1>
                <div className="container mx-auto px-4 rounded">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {allProducts && allProducts.length > 0 ? (
                            allProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-xl text-gray-400">Đang tải sản phẩm...</p>
                        )}
                    </div>
                </div>

                {/* Featured Products Section */}
                {featuredProducts && featuredProducts.length > 0 && (
                    <FeaturedProducts featuredProducts={featuredProducts} />
                )}
            </div>
        </div>
    );
};

export default HomePage;
