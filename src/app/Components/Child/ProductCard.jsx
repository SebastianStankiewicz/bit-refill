import React from "react";
import Image from "next/image";

function ProductCard({ product, handleSpendXp }) {

  const handlePurchase = () => {
    if (handleSpendXp) {
      handleSpendXp(product.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-[#002B28]/20">
      <div className="flex items-center gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={product.imgURL}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-lg font-semibold text-green-600">${product.usdValue}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#002B28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-lg font-bold text-[#002B28]">{product.xpValue} XP</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              product.enabled 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                product.enabled ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {product.enabled ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <div className="flex-shrink-0">
          <button 
            onClick={handlePurchase}
            disabled={!product.enabled}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              product.enabled
                ? 'bg-gradient-to-r from-[#002B28] to-[#004540] text-white hover:from-[#004540] hover:to-[#006B5C] hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {product.enabled ? 'Redeem' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
