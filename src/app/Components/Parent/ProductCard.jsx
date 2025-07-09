import React, { useState } from 'react';
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl shadow-md bg-white space-y-3 max-w-sm mx-auto">
      {/* Product Image */}
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

      {/* Product Details */}
      <div className="text-center w-full space-y-1">
        <div className="text-2xl font-bold text-gray-800">
          {product.name} ${product.usdValue}
        </div>
        <div className="text-xl text-green-600 font-semibold">{product.xpValue} XP</div>
        <div className="text-sm text-gray-700">
          Status:{" "}
          <span className={`font-medium ${product.enabled ? 'text-blue-600' : 'text-red-600'}`}>
            {product.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Family Shop Toggle (visual only) */}
      <div className="flex items-center space-x-2 mt-2">
        <span className="text-gray-700">In family shop?</span>
        <div className="relative inline-block w-12 h-6 bg-gray-300 rounded-full cursor-not-allowed">
          <div className="absolute left-0 w-6 h-6 transition duration-200 ease-in-out transform bg-white rounded-full shadow-md translate-x-0"></div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard