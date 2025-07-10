import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

function Store({ supabase, handleSpendXp, familyId, apiKey }) {
  const [products, setProducts] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    const fetchFamilyGiftCards = async () => {
      try {
        const { data, error } = await supabase
          .from("family_gift_cards")
          .select("*")
          .eq("family_id", familyId)
          .eq("is_active", true); // Only fetch active cards

        if (error) throw error;
        console.log("Gift cards:", data);
        const mappedProducts = data.map((card) => ({
          name: card.product_name,
          usdValue: parseFloat(card.value_in_currency),
          xpValue: card.xp_cost,
          enabled: true, // You can add logic later to toggle this based on inventory, etc.
          imgURL:
            card.image_url ??
            "https://cdn.bitrefill.com/primg/w720h432/bitrefill-giftcard-usd.webp",
          id: card.id,
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching family gift cards:", err.message);
      }
    };

    const fetchOrderHistory = async () => {
      try {
        const res = await fetch(
          `/api/bitrefill/orders/?apiKey=${encodeURIComponent(apiKey)}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to fetch orders", errorData);
          return;
        }

        const data = await res.json();
        setOrderHistory(data);
        console.log("Orders:", data);
      } catch (err) {
        console.error("Unexpected error during test card purchase:", err);
      }
    };

    fetchFamilyGiftCards();
    fetchOrderHistory();
  }, []);

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
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Available Products
              </h2>
              <p className="text-gray-600">Choose your rewards</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            {products.length > 0 ? (
              products.map((product, i) => (
                <ProductCard
                  key={i}
                  product={product}
                  handleSpendXp={handleSpendXp}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products available
                </h3>
                <p className="text-gray-500">
                  Check back later for new rewards
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History Section */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Purchase History
              </h3>
              <p className="text-gray-600">Your redeemed rewards</p>
            </div>
          </div>

          <div className="space-y-3">
            {orderHistory?.data?.length > 0 ? (
              orderHistory.data.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {order.product?.name ?? "Unknown Product"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-gray-600">
                        {order.redemption_info?.code ?? "Pending"}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status === "delivered" ? "Redeemed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-6">
                No gift card purchases yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Store;
