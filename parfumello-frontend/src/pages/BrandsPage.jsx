import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/brands/")
      .then((res) => setBrands(res.data.results || res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">Discover</p>
          <h1 className="text-5xl font-serif text-rose-900 mb-2">Perfume Houses</h1>
          <p className="text-gray-500 mt-2">{brands.length} {brands.length === 1 ? "house" : "houses"}</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : brands.length === 0 ? (
          <p className="text-center text-gray-400">No brands yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="group bg-white rounded-3xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-5"
              >
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-16 h-16 object-contain rounded-2xl border border-rose-100 bg-white p-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl font-serif text-rose-400 flex-shrink-0">
                    {brand.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-lg font-serif text-rose-900 group-hover:text-rose-700 transition-colors">{brand.name}</p>
                  {brand.country && <p className="text-sm text-gray-400">{brand.country}</p>}
                  {brand.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{brand.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BrandsPage;
