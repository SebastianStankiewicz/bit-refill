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
    <div className="border p-6 rounded-lg space-y-4 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800">Spend Your XP</h2>
      {products.map((product, i) => (
        <ProductCard key={i} product={product} />
      ))}

<div className="pt-6 border-t space-y-2">
        <h3 className="text-xl font-semibold text-gray-700">Purchased</h3>
        <div className="text-sm text-gray-600">Date - Name - Product Code</div>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>2025-07-01 - Roblox $5 - XXXX-XXXX-XXXX</li>
          <li>2025-07-03 - Roblox $10 - YYYY-YYYY-YYYY</li>
        </ul>
      </div>
    </div>
  );
}

export default Store;
