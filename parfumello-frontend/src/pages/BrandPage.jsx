import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PerfumeCard from "../components/PerfumeCard";

function BrandPage() {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/brands/${id}/`),
      api.get(`/api/perfumes/?brand_id=${id}`),
    ])
      .then(([brandRes, perfumesRes]) => {
        setBrand(brandRes.data);
        setPerfumes(perfumesRes.data.results || perfumesRes.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          <>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
              {brand?.logo_url && (
                <div className="flex-shrink-0">
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-48 h-48 object-contain rounded-3xl border border-rose-100 shadow-sm bg-white p-4"
                  />
                </div>
              )}
              <div className="flex-1 md:pt-2">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">Perfume House</p>
                <h1 className="text-5xl font-serif text-rose-900 mb-2">{brand?.name}</h1>
                {brand?.country && (
                  <p className="text-gray-400 text-sm mb-4">{brand.country}</p>
                )}
                {brand?.description && (
                  <p className="text-gray-500 leading-7">{brand.description}</p>
                )}
                <p className="text-gray-400 text-sm mt-4">{perfumes.length} {perfumes.length === 1 ? "fragrance" : "fragrances"}</p>
              </div>
            </div>

            {perfumes.length === 0 ? (
              <p className="text-center text-gray-400">No perfumes found for this brand.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {perfumes.map((perfume) => (
                  <PerfumeCard key={perfume.id} perfume={perfume} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BrandPage;
