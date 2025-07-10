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

    purchaseTestCard();
  }, [apiKey]);

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 w-full min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Gift Cards Powered By Bitrefill
          </h1>
          <p className="text-2xl font-semibold text-gray-700">
            Current Balance:{" "}
            <span className="font-extrabold text-green-600">
              {loadingBalance
                ? "Loading..."
                : balance !== null
                ? `£${balance}`
                : "Unavailable"}
            </span>
          </p>
        </div>

        {/* Products */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 border-b pb-3">
            Edit Shop
          </h2>

          {products.map((product, i) => (
            <ProductCard key={i} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Store;
