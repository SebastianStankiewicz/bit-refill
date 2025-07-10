import React, { useState } from 'react';
import Image from 'next/image';

function ProductCard({ product }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center gap-6 p-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
            <Image
              src={product.imgURL}
              alt={`${product.name} Gift Card`}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-lg font-semibold text-[#002B28]">
                  ${product.usdValue}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {product.xpValue} XP
                </span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                product.enabled 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  product.enabled ? 'bg-blue-500' : 'bg-red-500'
                }`}></div>
                {product.enabled ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Family Shop Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Available in Family Shop</span>
            </div>
            
            <div className="relative">
              <div className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 ${
                product.enabled ? 'bg-[#002B28]' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  product.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard