import { Link } from "react-router-dom";
import { Sparkles, ScanSearch } from "lucide-react";

function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-serif text-rose-900 mb-6">
            Discover Your Signature Scent
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our curated collection of premium fragrances from around the world
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="inline-block bg-rose-900 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors shadow-lg hover:shadow-xl"
            >
              Shop Collection
            </Link>
            <Link
              to="/compatibility"
              className="inline-flex items-center gap-2 border border-rose-300 text-rose-700 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Match Fragrances
            </Link>
            <Link
              to="/similar"
              className="inline-flex items-center gap-2 border border-rose-300 text-rose-700 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors"
            >
              <ScanSearch className="w-4 h-4" />
              Find Similar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;