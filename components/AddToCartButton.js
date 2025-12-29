"use client";

import { useStore } from "@/context/StoreContext";
import { ShoppingCart } from "lucide-react";

const AddToCartButton = ({ product }) => {
    const { addToCart } = useStore();

    return (
        <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.inStock}
            className={`w-full max-w-sm flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold transition-colors ${product.inStock ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
            <ShoppingCart className="w-5 h-5" />
            <span>{product.inStock ? 'أضف للسلة' : 'غير متوفر'}</span>
        </button>
    );
}

export default AddToCartButton;