import React, { useState } from "react";
import ProductCard from "./ProductCard";

function Store({ handleSpendXp }) {
  const [products, setProducts] = useState([
    {
      name: "Roblox",
      usdValue: 5,
      xpValue: 100,
      enabled: true,
      imgURL:
        "https://cdn.bitrefill.com/primg/w720h432/roblox-united-kingdom.webp",
    },
    {
      name: "Roblox",
      usdValue: 10,
      xpValue: 200,
      enabled: true,
      imgURL:
        "https://cdn.bitrefill.com/primg/w720h432/roblox-united-kingdom.webp",
    },
  ]);

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">
              Gift Card Store
            </h1>
            <p className="text-gray-600">Redeem your XP for amazing rewards</p>
          </div>
        </div>

        {/* Available Products Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#002B28] rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Available Products</h2>
              <p className="text-gray-600">Choose your rewards</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product, i) => (
                <ProductCard key={i} product={product} handleSpendXp={handleSpendXp} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-500">Check back later for new rewards</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History Section */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Purchase History</h3>
              <p className="text-gray-600">Your redeemed rewards</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Roblox $5</p>
                    <p className="text-sm text-gray-500">July 1, 2025</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-gray-600">XXXX-XXXX-XXXX</p>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Redeemed
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Roblox $10</p>
                    <p className="text-sm text-gray-500">July 3, 2025</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-gray-600">YYYY-YYYY-YYYY</p>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Redeemed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
