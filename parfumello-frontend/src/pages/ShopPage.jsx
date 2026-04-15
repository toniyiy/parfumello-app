import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import api from "../api";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PerfumeCard from "../components/PerfumeCard";

const CURRENT_YEAR = new Date().getFullYear();

const GENDER_MAP = {
  men: { label: "Men's Perfumes", sex: "male", tagline: "Bold, refined, and unmistakably him." },
  women: { label: "Women's Perfumes", sex: "female", tagline: "Delicate, powerful, and unmistakably her." },
  unisex: { label: "Unisex Perfumes", sex: "unisex", tagline: "Fragrances with no rules — worn by anyone." },
};

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "default", label: "Default" },
];

function ShopPage() {
  const { gender } = useParams(); // "men" | "women" | "unisex" | "new" | undefined
  const isNew = gender === "new";
  const meta = gender && !isNew ? GENDER_MAP[gender] : null;

  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("rating");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState("");
  const [newOnly, setNewOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/perfumes/")
      .then((res) => {
        const data = res.data.results || res.data;
        setPerfumes(data);

        const uniqueBrands = [
          ...new Map(
            data
              .filter((p) => p.brand)
              .map((p) => [p.brand.id, p.brand])
          ).values(),
        ].sort((a, b) => a.name.localeCompare(b.name));
        setBrands(uniqueBrands);
      })
      .catch((err) => console.error("Failed to fetch perfumes:", err))
      .finally(() => setLoading(false));
  }, []);

  const displayed = useMemo(() => {
    let list = perfumes;

    if (isNew || newOnly) {
      list = list.filter((p) => p.release_year >= CURRENT_YEAR - 1);
    }
    if (meta) {
      list = list.filter((p) => p.sex?.toLowerCase() === meta.sex);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.name?.toLowerCase().includes(q)
      );
    }

    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand?.id));
    }

    if (maxPrice !== "") {
      const cap = parseFloat(maxPrice);
      if (!isNaN(cap)) list = list.filter((p) => p.price <= cap);
    }

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    else if (sort === "newest") list = [...list].sort((a, b) => b.release_year - a.release_year);

    return list;
  }, [perfumes, meta, isNew, newOnly, search, selectedBrands, maxPrice, sort]);

  function toggleBrand(id) {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setSearch("");
    setSelectedBrands([]);
    setMaxPrice("");
    setSort("rating");
    setNewOnly(false);
  }

  const hasActiveFilters =
    search || selectedBrands.length > 0 || maxPrice !== "" || sort !== "rating" || newOnly;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        {isNew ? (
          <>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">Just In</p>
            <h1 className="text-5xl font-serif text-rose-900 mb-4">New Arrivals</h1>
            <p className="text-gray-500 text-lg">The latest additions to our collection.</p>
          </>
        ) : gender ? (
          <>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">
              {gender === "men" ? "For Him" : gender === "women" ? "For Her" : "Everyone"}
            </p>
            <h1 className="text-5xl font-serif text-rose-900 mb-4">{meta.label}</h1>
            <p className="text-gray-500 text-lg">{meta.tagline}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">Collection</p>
            <h1 className="text-5xl font-serif text-rose-900 mb-4">All Perfumes</h1>
            <p className="text-gray-500 text-lg">
              Explore our full catalogue — every scent, every story.
            </p>
          </>
        )}

        {/* Gender tabs */}
        <div className="flex justify-center gap-2 mt-8">
          <Link
            to="/shop"
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              !gender
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            All
          </Link>
          <Link
            to="/shop/men"
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              gender === "men"
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            Men
          </Link>
          <Link
            to="/shop/women"
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              gender === "women"
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            Women
          </Link>
          <Link
            to="/shop/unisex"
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              gender === "unisex"
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
            }`}
          >
            Unisex
          </Link>
          <Link
            to="/shop/new"
            className={`px-5 py-2 rounded-full text-sm border transition-colors ${
              isNew
                ? "bg-rose-900 text-white border-rose-900"
                : "bg-white text-rose-500 border-rose-300 hover:border-rose-500"
            }`}
          >
            New ✦
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-rose-200 text-sm text-gray-700 hover:border-rose-400 transition-colors bg-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}

            <p className="text-sm text-gray-400">
              {loading ? "Loading..." : `${displayed.length} results`}
            </p>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-rose-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="bg-white border border-rose-100 rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
            {/* Search */}
            <div>
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">Search</p>
              <input
                type="text"
                placeholder="Name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-rose-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
              {!isNew && (
                <button
                  onClick={() => setNewOnly((o) => !o)}
                  className={`mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border text-sm transition-colors ${
                    newOnly
                      ? "bg-rose-900 text-white border-rose-900"
                      : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
                  }`}
                >
                  <span>New Arrivals only</span>
                  {newOnly && <span>✓</span>}
                </button>
              )}
            </div>

            {/* Max price */}
            <div>
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">Max Price ($)</p>
              <input
                type="number"
                placeholder="e.g. 150"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
                className="w-full border border-rose-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            {/* Brands */}
            <div>
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">Brand</p>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => toggleBrand(b.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selectedBrands.includes(b.id)
                        ? "bg-rose-900 text-white border-rose-900"
                        : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-rose-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-rose-100 rounded w-3/4" />
                  <div className="h-3 bg-rose-50 rounded w-1/2" />
                  <div className="h-3 bg-rose-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🌹</span>
            </div>
            <h3 className="text-xl font-serif text-rose-900 mb-2">No perfumes found</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your filters.</p>
            <button
              onClick={clearFilters}
              className="text-sm text-rose-500 hover:text-rose-700 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayed.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ShopPage;
