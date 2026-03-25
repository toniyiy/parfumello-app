import { Star } from "lucide-react";
import { Link } from "react-router-dom";

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

function PerfumeCard({ perfume, image }) {
  return (
    <Link to={`/perfumes/${perfume.id}`}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer">
        <div className="relative h-64 bg-gradient-to-br from-rose-100 to-amber-50 overflow-hidden">
          <img
            src={image}
            alt={perfume.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-rose-900 font-semibold text-sm">New</span>
          </div>
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
            <button className="bg-rose-900 text-white px-4 py-2 rounded-full hover:bg-rose-800 transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PerfumeCard;