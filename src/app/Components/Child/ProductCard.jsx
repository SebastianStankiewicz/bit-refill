import React, { useState } from "react";
import Image from "next/image";

function ProductCard({ product }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl shadow-md bg-white space-y-3 max-w-sm mx-auto">
      <div className="w-full rounded-lg overflow-hidden border border-gray-100">
        <Image
          src={product.imgURL}
          alt={`${product.name} Gift Card`}
          width={360}
          height={216}
          layout="responsive"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      <div className="text-center w-full space-y-1">
        <div className="text-2xl font-bold text-gray-800">
          {product.name} ${product.usdValue}
        </div>
        <div className="text-xl text-green-600 font-semibold">
          {product.xpValue} XP
        </div>
        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors text-xl font-semibold">
          Purchase
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
