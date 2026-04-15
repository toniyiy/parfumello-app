import { useSearchParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">Thank You</p>
          <h1 className="text-4xl font-serif text-rose-900 mb-3">Order Placed!</h1>
          <p className="text-gray-500 mb-2">
            Your order has been confirmed and is being prepared with care.
          </p>
          {orderId && (
            <p className="text-sm text-gray-400 mb-8">
              Order #{orderId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-8 py-3 bg-rose-900 text-white rounded-full text-sm font-semibold hover:bg-rose-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/profile"
              className="px-8 py-3 border border-rose-200 text-rose-900 rounded-full text-sm font-semibold hover:border-rose-400 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OrderConfirmationPage;
