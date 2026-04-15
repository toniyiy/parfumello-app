import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api";
import { Lock, ChevronLeft, Package } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#e11d48" },
  },
};

function CheckoutForm({ items, totalPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shipping, setShipping] = useState({
    full_name: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  function handleShippingChange(e) {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleShippingSubmit(e) {
    e.preventDefault();
    const { full_name, email, address, city, postal_code, country } = shipping;
    if (!full_name || !email || !address || !city || !postal_code || !country) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      const { data: intentData } = await api.post("/api/checkout/payment-intent/", { items });

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: shipping.full_name,
              email: shipping.email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      const { data: orderData } = await api.post("/api/orders/", {
        payment_intent_id: paymentIntent.id,
        shipping,
        items,
      });

      navigate(`/order-confirmation?id=${orderData.order_id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            step >= 1 ? "text-rose-900" : "text-gray-400"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 1 ? "bg-rose-900 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            1
          </span>
          Shipping
        </div>
        <div className="flex-1 h-px bg-rose-100" />
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            step >= 2 ? "text-rose-900" : "text-gray-400"
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step >= 2 ? "bg-rose-900 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            2
          </span>
          Payment
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3">
          {step === 1 ? (
            <form onSubmit={handleShippingSubmit} className="space-y-5">
              <h2 className="text-2xl font-serif text-rose-900 mb-6">Shipping Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={shipping.full_name}
                    onChange={handleShippingChange}
                    placeholder="Jane Doe"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shipping.email}
                    onChange={handleShippingChange}
                    placeholder="jane@example.com"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={shipping.address}
                  onChange={handleShippingChange}
                  placeholder="123 Rue de la Paix"
                  className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={handleShippingChange}
                    placeholder="Paris"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={shipping.postal_code}
                    onChange={handleShippingChange}
                    placeholder="75001"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    placeholder="France"
                    className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              {error && <p className="text-rose-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-rose-900 text-white py-3.5 rounded-full hover:bg-rose-800 transition-colors font-semibold text-sm mt-2"
              >
                Continue to Payment
              </button>
            </form>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <h2 className="text-2xl font-serif text-rose-900">Payment</h2>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{shipping.full_name}</p>
                <p>{shipping.address}, {shipping.city} {shipping.postal_code}</p>
                <p>{shipping.country} · {shipping.email}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
                  Card Details
                </label>
                <div className="border border-rose-200 rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-rose-300 transition-shadow">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Powered by Stripe — your payment is secure
                </p>
              </div>

              {error && <p className="text-rose-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-rose-900 text-white py-3.5 rounded-full hover:bg-rose-800 transition-colors font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing…" : `Pay $${totalPrice.toFixed(2)}`}
              </button>

              {import.meta.env.DEV && (
                <p className="text-xs text-center text-gray-400">
                  Test card: 4242 4242 4242 4242 · any future date · any CVC
                </p>
              )}
            </form>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sticky top-24">
            <h3 className="text-sm uppercase tracking-widest text-rose-400 mb-5">Order Summary</h3>
            <div className="space-y-4 mb-5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.image_url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl border border-rose-50"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-900 text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">${item.price} each</p>
                  </div>
                  <p className="text-sm font-semibold text-rose-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-rose-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-rose-900 pt-2 border-t border-rose-100">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      navigate("/shop");
    }
  }, [user, items, navigate]);

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Link to="/shop" className="text-xs text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Back to shop
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-rose-300" />
          <h1 className="text-4xl font-serif text-rose-900">Checkout</h1>
        </div>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm items={items} totalPrice={totalPrice} />
      </Elements>

      <Footer />
    </div>
  );
}

export default CheckoutPage;
