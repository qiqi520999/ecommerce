import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const PeopleAlsoBought = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrendingProducts = async () => {
        setIsLoading(true);
        try {
            // Using the popular recommendations endpoint
            const response = await axios.get("/api/recommendations/popular?count=5");

            if (response.data.status === "success") {
                setTrendingProducts(response.data.recommendations);
            } else {
                throw new Error(response.data.message || "Failed to fetch trending products");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching trending products");

            // Optional: Fallback to sample data if the API fails
            setTrendingProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrendingProducts();
    }, []);

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-semibold text-emerald-400">People also bought</h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trendingProducts.length > 0 ? (
                    trendingProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))
                ) : (
                    <p className="text-gray-500">No trending products available.</p>
                )}
            </div>
        </div>
    );
};

export default PeopleAlsoBought;
