"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";

function Store({ apiKey }) {
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [products, setProducts] = useState([
    {
      name: "Test Gift Card",
      usdValue: 0,
      xpValue: 200,
      enabled: true,
      imgURL:
        "https://cdn.bitrefill.com/primg/w720h432/bitrefill-giftcard-usd.webp",
    },
    {
      name: "Roblox",
      usdValue: 5,
      xpValue: 100,
      enabled: false,
      imgURL:
        "https://cdn.bitrefill.com/primg/w720h432/roblox-united-kingdom.webp",
    },
    {
      name: "Roblox",
      usdValue: 10,
      xpValue: 200,
      enabled: false,
      imgURL:
        "https://cdn.bitrefill.com/primg/w720h432/roblox-united-kingdom.webp",
    }

  ]);

  useEffect(() => {
    if (!apiKey) return;

    // Fetch balance
    const fetchBalance = async () => {
      setLoadingBalance(true);
      try {
        const res = await fetch(
          `/api/bitrefill/balance?apiKey=${encodeURIComponent(apiKey)}`
        );
        if (!res.ok) throw new Error("Failed to fetch balance");
        const data = await res.json();
        console.log(data);
        setBalance(data.data.balance ?? null);
      } catch (err) {
        console.error("Bitrefill balance fetch failed:", err);
        setBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(
          `/api/bitrefill/products?apiKey=${encodeURIComponent(apiKey)}&includeTestProducts=true`
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        console.log(data);
      } catch (err) {
        console.error("Bitrefill products fetch failed:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    const purchaseTestCard = async () => {
      try {
        const res = await fetch(
          `/api/bitrefill/purchase-test/?apiKey=${encodeURIComponent(apiKey)}`
        );
    
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Test card purchase failed:", errorData);
          return;
        }
    
        const data = await res.json();
        console.log("Test Purchase:", data);
      } catch (err) {
        console.error("Unexpected error during test card purchase:", err);
      }
    };
    
  
    //fetchProducts();

    fetchBalance();

    //purchaseTestCard();
  }, [apiKey]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#002B28] to-[#004540] bg-clip-text text-transparent">
                Gift Card Store
              </h1>
              <p className="text-gray-600">Powered by Bitrefill</p>
            </div>
            
            {/* Balance Card */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-6 py-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-700">Current Balance</p>
                <p className="text-xl font-bold text-green-800">
                  {loadingBalance
                    ? "Loading..."
                    : balance !== null
                    ? `£${balance}`
                    : "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#002B28] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
                <p className="text-gray-600">Configure available gift cards</p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product, i) => (
                <ProductCard key={i} product={product} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-500">Add some gift cards to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
