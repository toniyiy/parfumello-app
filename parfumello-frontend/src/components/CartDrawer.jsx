import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-[380px] z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#ffffff", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200" style={{ backgroundColor: "#ffffff" }}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-rose-900" />
            <h2 className="text-base font-semibold text-gray-900">
              Cart
              {items.length > 0 && (
                <span className="ml-1 text-sm font-normal text-gray-400">
                  ({items.length} {items.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor: "#f9f9f9" }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <ShoppingBag className="w-12 h-12 text-rose-100" />
              <p className="text-gray-400 text-sm">Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px" }}
              >
                {/* Top: image + name + delete */}
                <div className="flex items-center gap-3 p-3">
                  <img
                    src={item.image_url || "/placeholder.jpg"}
                    alt={item.name}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12, flexShrink: 0, border: "1px solid #f3f4f6", backgroundColor: "#fff" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">${item.price} each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex-shrink-0 p-1.5 hover:bg-red-50 rounded-full transition-colors self-start"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {/* Bottom: qty + total */}
                <div
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6", borderRadius: "0 0 16px 16px" }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ backgroundColor: "#e5e7eb", borderRadius: 999, padding: "4px 12px" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-700 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-rose-900 font-bold text-base">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="text-xl font-bold text-rose-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full bg-rose-900 text-white py-3 rounded-full hover:bg-rose-800 transition-colors font-semibold text-sm mb-2"
            >
              Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
