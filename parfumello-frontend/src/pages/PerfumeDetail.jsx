import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { Star, Trash2, Heart } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const StarRating = ({ rating, size = 20 }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <Star className="absolute text-gray-300" style={{ width: size, height: size }} />
            <div className="absolute overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-amber-400 fill-amber-400" style={{ width: size, height: size }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

function ReviewForm({ perfumeId, existingReview, onSaved }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setError("");
    setLoading(true);
    try {
      if (existingReview) {
        await api.patch(`/api/reviews/${existingReview.id}/`, { rating, comment });
      } else {
        await api.post("/api/reviews/", { perfume: perfumeId, rating, comment });
      }
      onSaved();
    } catch (err) {
      const data = err.response?.data;
      const messages = data ? Object.values(data).flat() : [];
      setError(messages[0] || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900 resize-none"
          placeholder="Share your thoughts on this fragrance..."
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-rose-900 text-white px-6 py-2.5 rounded-full hover:bg-rose-800 transition-colors disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : existingReview
          ? "Update review"
          : "Submit review"}
      </button>
    </form>
  );
}

function PerfumeDetail() {
  const { id } = useParams();
  const { user, favorites, toggleFavorite } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function fetchPerfume() {
    api
      .get(`/api/perfumes/${id}/`)
      .then((res) => { setPerfume(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setError("Failed to load perfume details."); setLoading(false); });
  }

  useEffect(() => { fetchPerfume(); }, [id]);

  const myReview = perfume?.reviews?.find(
    (r) => r.user?.username === user?.username
  );

  function handleSaved() {
    setEditingReview(null);
    setShowForm(false);
    fetchPerfume();
  }

  async function handleDeleteReview(reviewId) {
    try {
      await api.delete(`/api/reviews/${reviewId}/`);
      fetchPerfume();
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="text-center text-gray-500 text-lg">Loading perfume...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !perfume) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-24">
          <p className="text-center text-red-500 text-lg">{error || "Perfume not found."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="rounded-3xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-lg border border-rose-100">
            <div className="h-[520px] bg-gradient-to-br from-rose-100 to-amber-50">
              <img
                src={perfume.image_url || "/placeholder.jpg"}
                alt={perfume.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm uppercase tracking-[0.25em] text-rose-500 mb-3">
              {perfume.brand?.name || "Luxury Fragrance"}
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
              {perfume.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={perfume.average_rating || 0} size={20} />
              <span className="text-gray-600 text-sm">
                {perfume.average_rating ? `${perfume.average_rating}/5` : "No ratings yet"}
              </span>
            </div>

            <p className="text-lg text-gray-600 leading-8 mb-8">
              {perfume.description || "A refined and elegant fragrance crafted for timeless moments."}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
              <span className="text-3xl font-semibold text-rose-900">
                {perfume.price !== null && perfume.price !== undefined
                  ? `$${perfume.price}`
                  : "Price unavailable"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!user) { navigate("/login"); return; }
                    toggleFavorite(perfume.id);
                  }}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-rose-200 hover:bg-rose-50 transition-colors"
                  title={favorites.includes(perfume.id) ? "Remove from favourites" : "Add to favourites"}
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      favorites.includes(perfume.id)
                        ? "fill-rose-500 text-rose-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                <button
                  onClick={() => addToCart(perfume)}
                  className="bg-rose-900 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors shadow-md"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fragrance Notes</h2>
              <div className="flex flex-wrap gap-3">
                {perfume.notes && perfume.notes.length > 0 ? (
                  perfume.notes.map((note) => (
                    <span
                      key={note.id}
                      className="px-4 py-2 rounded-full bg-white border border-rose-100 text-gray-700 shadow-sm"
                    >
                      {note.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No notes listed.</p>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Why you'll love it</h3>
              <p className="text-gray-600 leading-7">
                Designed to feel elegant, modern, and memorable — a fragrance that fits both everyday wear and special occasions.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-rose-500 mb-2">Community</p>
              <h2 className="text-3xl font-semibold text-gray-900">Reviews</h2>
            </div>

            {user && !myReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-rose-900 text-white px-6 py-2.5 rounded-full hover:bg-rose-800 transition-colors"
              >
                Leave a review
              </button>
            )}
          </div>

          {user && showForm && !myReview && (
            <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your review</h3>
              <ReviewForm perfumeId={perfume.id} onSaved={handleSaved} />
            </div>
          )}

          {!user && (
            <p className="text-gray-500 text-sm mb-6">
              <a href="/login" className="text-rose-900 underline">Sign in</a> to leave a review.
            </p>
          )}

          <div className="space-y-6">
            {perfume.reviews && perfume.reviews.length > 0 ? (
              [...perfume.reviews]
                .sort((a, b) => {
                  if (a.user?.username === user?.username) return -1;
                  if (b.user?.username === user?.username) return 1;
                  return 0;
                })
                .map((review) => {
                const isOwner = review.user?.username === user?.username;
                const isEditing = editingReview?.id === review.id;

                return (
                  <div
                    key={review.id}
                    className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <p className="font-medium text-gray-900">
                        {review.user?.username || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating || 0} size={16} />
                        {isOwner && !isEditing && (
                          <>
                            <button
                              onClick={() => setEditingReview(review)}
                              className="text-sm text-rose-900 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete review"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                        {isOwner && isEditing && (
                          <button
                            onClick={() => setEditingReview(null)}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <ReviewForm
                        perfumeId={perfume.id}
                        existingReview={review}
                        onSaved={handleSaved}
                      />
                    ) : (
                      <p className="text-gray-600 leading-7">{review.comment || "No comment provided."}</p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500">No reviews yet. Be the first to share your thoughts.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PerfumeDetail;
