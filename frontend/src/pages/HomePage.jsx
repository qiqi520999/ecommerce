import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import CategoryItem from "../components/CategoryItem";
// import { useProductStore } from "../stores/useProductStore"; // Not used for allProducts in current code
import FeaturedProducts from "../components/FeaturedProducts";
import BannerProduct from "../components/BannerProduct";
import ProductCard from "../components/ProductCard";

const categories = [
    { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
    { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
    { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
    { href: "/items", name: "Items", imageUrl: "/glasses.png" },
    { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
    { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
    { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];



const HomePage = () => {
    // const { fetchFeaturedProducts, fetchAllProducts, products, loading: storeLoading } = useProductStore();
    const [allProducts, setAllProducts] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'asc' });
    const { category } = useParams();

    const PRODUCTS_TO_DISPLAY = 20; // Define how many products to show initially or after sorting

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
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5001/api/products");
                const data = await response.json();
                setAllProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching all products:", error);
            } finally {
                setLoading(false);
            }
        };
        getAllProducts();
    }, []);

    const sortedAndLimitedProducts = useMemo(() => {
        let sortableProducts = [...allProducts];
        if (sortConfig.key !== 'default') {
            sortableProducts.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Handle cases where properties might be missing for custom sorts
                if (sortConfig.key === 'purchaseCount' || sortConfig.key === 'viewCount') {
                    valA = valA || 0;
                    valB = valB || 0;
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        // return sortableProducts.slice(0, PRODUCTS_TO_DISPLAY); // Limit to 20 products
        return sortableProducts; // Display all sorted products, or slice if preferred
    }, [allProducts, sortConfig]);

    const handleSort = (key, direction = 'asc') => {
        // If the same key is clicked, toggle direction (or set specific direction)
        if (sortConfig.key === key && sortConfig.direction === direction) {
             // Optional: if you want to toggle or reset
            // setSortConfig({ key: 'default', direction: 'asc' }); // Reset to default
            return; // Or toggle direction: setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
        }
        setSortConfig({ key, direction });
    };

    const sortOptions = [
        { label: "Mặc định", key: "default", direction: "asc" },
        { label: "Tên: A-Z", key: "name", direction: "asc" },
        { label: "Tên: Z-A", key: "name", direction: "desc" },
        { label: "Giá: Thấp đến Cao", key: "price", direction: "asc" },
        { label: "Giá: Cao đến Thấp", key: "price", direction: "desc" },
        { label: "Phổ biến (Lượt mua)", key: "purchaseCount", direction: "desc" }, // Backend needs to provide purchaseCount
        { label: "Lượt xem nhiều", key: "viewCount", direction: "desc" }, // Backend needs to provide viewCount
        // "Sắp xếp theo cart" is ambiguous for a general homepage.
        // If it means "items in current user's cart", that's for a cart page.
        // If it means "globally most added to cart", backend needs to provide this data.
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-white">
                <p className="text-xl">Đang tải sản phẩm...</p>
            </div>
        );
    }
    // console.log("allProducts:", allProducts);
    // console.log("featuredProducts:", featuredProducts);
    // console.log("sortedAndLimitedProducts:", sortedAndLimitedProducts);

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

                {/* Sort Buttons Section */}
                <div className="my-8">
                    <h2 className="text-2xl font-semibold mb-4 text-center text-emerald-300">FILTER</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {sortOptions.map(option => (
                            <button
                                key={option.label}
                                onClick={() => handleSort(option.key, option.direction)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                            ${sortConfig.key === option.key && sortConfig.direction === option.direction 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-gray-700 hover:bg-emerald-600 text-gray-200'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-400">
                        {/* Lưu ý: Sắp xếp theo "Lượt mua" và "Lượt xem" yêu cầu dữ liệu từ backend. */}
                    </p>
                </div>

                {/* Products Section */}
				<h1 className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8">All Products</h1>
                <div className="container mx-auto px-4 rounded">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {sortedAndLimitedProducts && sortedAndLimitedProducts.length > 0 ? (
                            sortedAndLimitedProducts.map((product) => (
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
