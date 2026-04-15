import { useState, useEffect } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const STATUS_LABEL = {
  paid: { text: "Confirmed", color: "bg-blue-100 text-blue-700" },
  shipped: { text: "Shipped", color: "bg-amber-100 text-amber-700" },
  delivered: { text: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { text: "Cancelled", color: "bg-gray-100 text-gray-500" },
};

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api
      .get("/api/orders/history/")
      .then((res) => setOrders(res.data.results || res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  // Assign per-user order numbers: oldest order = #1
  const orderNumberMap = {};
  [...orders].reverse().forEach((o, i) => { orderNumberMap[o.id] = i + 1; });

  const filtered = orders.filter((o) =>
    tab === "active"
      ? ["paid", "shipped"].includes(o.status)
      : ["delivered", "cancelled"].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-6 h-6 text-rose-300" />
          <h1 className="text-4xl font-serif text-rose-900">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-7">
          <button
            onClick={() => { setTab("active"); setVisibleCount(5); }}
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              tab === "active"
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setTab("past"); setVisibleCount(5); }}
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              tab === "past"
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            Past
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-rose-100 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-rose-100 rounded w-1/4 mb-3" />
                <div className="h-3 bg-rose-50 rounded w-1/2 mb-2" />
                <div className="h-3 bg-rose-50 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Clock className="w-14 h-14 mx-auto mb-4 text-rose-100" />
            <p className="text-lg font-serif text-rose-900 mb-1">
              {tab === "active" ? "No active orders" : "No past orders yet"}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {tab === "active"
                ? "Your confirmed and shipped orders will appear here."
                : "Completed and cancelled orders will appear here."}
            </p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-rose-900 text-white rounded-full text-sm font-semibold hover:bg-rose-800 transition-colors"
            >
              Browse perfumes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.slice(0, visibleCount).map((order) => {
              const badge = STATUS_LABEL[order.status] || { text: order.status, color: "bg-gray-100 text-gray-500" };
              return (
                <div key={order.id} className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-rose-900">Order #{orderNumberMap[order.id]}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.quantity}× {item.perfume_name}</span>
                        <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-rose-50 pt-3 flex justify-between items-center">
                    <p className="text-xs text-gray-400">{order.city}, {order.country}</p>
                    <p className="text-sm font-bold text-rose-900">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}

            {filtered.length > visibleCount && (
              <button
                onClick={() => setVisibleCount((c) => c + 5)}
                className="w-full py-3 text-sm text-rose-900 border border-rose-200 rounded-2xl hover:bg-rose-50 transition-colors"
              >
                Show {Math.min(5, filtered.length - visibleCount)} more
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default OrdersPage;
