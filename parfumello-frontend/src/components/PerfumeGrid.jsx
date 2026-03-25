import { Loader2 } from "lucide-react";
import PerfumeCard from "./PerfumeCard";

function PerfumeGrid({ perfumes, perfumeImages, loading, error }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-rose-900 animate-spin mb-4" />
        <p className="text-gray-600">Loading our finest perfumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-800 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-900 text-white px-6 py-2 rounded-full hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h3 className="text-3xl font-serif text-rose-900 mb-2">Featured Perfumes</h3>
        <p className="text-gray-600">Handpicked selections for the discerning nose</p>
      </div>

      {perfumes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No perfumes found in our collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {perfumes.map((perfume, index) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              image={perfumeImages[index % perfumeImages.length]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PerfumeGrid;