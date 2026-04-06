import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const StarRating = ({ rating, size = 20 }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);

        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            {/* Empty star */}
            <Star
              className="absolute text-gray-300"
              style={{ width: size, height: size }}
            />

            {/* Filled star */}
            <div
              className="absolute overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-amber-400 fill-amber-400"
                style={{ width: size, height: size }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

function PerfumeDetail() {
  const { id } = useParams();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/perfumes/${id}/`)
      .then((res) => {
        setPerfume(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load perfume details.");
        setLoading(false);
      });
  }, [id]);

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
          <p className="text-center text-red-500 text-lg">
            {error || "Perfume not found."}
          </p>
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
          {/* Image */}
          <div className="rounded-3xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-lg border border-rose-100">
            <div className="h-[520px] bg-gradient-to-br from-rose-100 to-amber-50">
              <img
                src={perfume.image_url || "/placeholder.jpg"}
                alt={perfume.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
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
                {perfume.average_rating
                  ? `${perfume.average_rating}/5`
                  : "No ratings yet"}
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

              <button className="bg-rose-900 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors shadow-md">
                Add to Cart
              </button>
            </div>

            {/* Notes */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fragrance Notes
              </h2>

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

            {/* Small info card */}
            <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Why you'll love it
              </h3>
              <p className="text-gray-600 leading-7">
                Designed to feel elegant, modern, and memorable — a fragrance
                that fits both everyday wear and special occasions.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-rose-500 mb-2">
              Community
            </p>
            <h2 className="text-3xl font-semibold text-gray-900">
              Reviews
            </h2>
          </div>

          <div className="space-y-6">
            {perfume.reviews && perfume.reviews.length > 0 ? (
              perfume.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <p className="font-medium text-gray-900">
                      {review.user?.username || "Anonymous"}
                    </p>

                    <StarRating rating={review.rating || 0} size={16} />
                  </div>

                  <p className="text-gray-600 leading-7">
                    {review.comment || "No comment provided."}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500">
                  No reviews yet. Be the first to share your thoughts.
                </p>
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