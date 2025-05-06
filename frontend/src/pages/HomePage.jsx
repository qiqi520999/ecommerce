import { useEffect } from "react";
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

const banners = [
    { name: "Summer Sale", imageUrl: "/download.jpg" },
    { name: "New Arrivals", imageUrl: "/download (1).jpg" },
    { name: "Winter Collection", imageUrl: "/download (2).jpg" },
];

const HomePage = () => {
    const { fetchFeaturedProducts, fetchAllProducts, products, isLoading } = useProductStore();
    const { category } = useParams();

    // Fetch featured products
    useEffect(() => {
        fetchFeaturedProducts();
    }, [fetchFeaturedProducts]);

    // Fetch all products (if needed for the page)
    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    console.log("products:", products);

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
                <div className="container mx-auto px-4 rounded">
                    <div className="h-56 md:h-72 w-full bg-slate-200 relative overflow-hidden">
                        {banners.map((banner) => (
                            <BannerProduct banner={banner} key={banner.name} />
                        ))}
                    </div>
                </div>

                {/* Products Section */}
				<h1 className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8">All Products</h1>
                <div className="container mx-auto px-4 rounded">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Featured Products Section */}
                {!isLoading && products.length > 0 && (
                    <FeaturedProducts featuredProducts={products} />
                )}
            </div>
        </div>
    );
};

export default HomePage;
