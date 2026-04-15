import { Star, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const StarRating = ({ rating, size = 20 }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);

        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <Star
              className="absolute text-gray-300"
              style={{ width: size, height: size }}
            />
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

function PerfumeCard({ perfume }) {
  const { addToCart } = useCart();
  const { user, favorites, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isFav = favorites.includes(perfume.id);

  function handleFavorite(e) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    toggleFavorite(perfume.id);
  }

  return (
    <Link to={`/perfumes/${perfume.id}`}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer">
        <div className="relative h-64 bg-gradient-to-br from-rose-100 to-amber-50 overflow-hidden">
          <img
            src={perfume.image_url || "/placeholder.jpg"}
            alt={perfume.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            {perfume.release_year >= new Date().getFullYear() - 1 ? (
              <span className="text-rose-600 font-semibold text-sm">New</span>
            ) : perfume.sex === "male" ? (
              <span className="text-blue-700 font-semibold text-sm">For Him</span>
            ) : perfume.sex === "female" ? (
              <span className="text-rose-600 font-semibold text-sm">For Her</span>
            ) : (
              <span className="text-violet-600 font-semibold text-sm">Unisex</span>
            )}
          </div>
          <button
            onClick={handleFavorite}
            className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            title={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFav ? "fill-rose-500 text-rose-500" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        <div className="p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-rose-900 transition-colors">
            {perfume.name}
          </h4>

          <p className="text-gray-500 text-sm mb-3">
            {perfume.brand?.name || "Unknown brand"}
          </p>

          {perfume.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {perfume.description}
            </p>
          )}

          <StarRating rating={perfume.average_rating || 0} size={16} />

          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-rose-900">
              {perfume.price !== null && perfume.price !== undefined
                ? `$${perfume.price}`
                : "Price unavailable"}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); addToCart(perfume); }}
              className="bg-rose-900 text-white px-4 py-2 rounded-full hover:bg-rose-800 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PerfumeCard;
