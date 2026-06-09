import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, X, Sparkles } from "lucide-react";

function PerfumeSearch({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      api
        .get(`/api/perfumes/?search=${encodeURIComponent(query)}`)
        .then((res) => setResults((res.data.results || res.data).slice(0, 8)))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(perfume) {
    onSelect(perfume);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="w-full max-w-md mx-auto" ref={ref}>
      {selected ? (
        <div className="flex items-center gap-3 bg-white border border-rose-200 rounded-2xl px-4 py-3 shadow-sm">
          {selected.image_url && (
            <img
              src={selected.image_url}
              alt={selected.name}
              className="w-12 h-12 object-cover rounded-xl border border-rose-100 flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{selected.name}</p>
            <p className="text-sm text-gray-400 truncate">{selected.brand?.name}</p>
          </div>
          <button
            onClick={handleClear}
            className="p-1.5 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center border border-rose-200 rounded-2xl bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-rose-300">
            <Search className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="Search by name or brand..."
              className="flex-1 px-3 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute z-20 top-full mt-2 w-full bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden">
              {results.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors text-left"
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-rose-100 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-rose-400 text-xs font-serif">{p.name[0]}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.brand?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  const color =
    score >= 55
      ? "bg-rose-900 text-white"
      : score >= 40
      ? "bg-rose-100 text-rose-700"
      : "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score}%
    </span>
  );
}


function SimilarPage() {
  const [perfume, setPerfume] = useState(null);
  const [maxPrice, setMaxPrice] = useState("");
  const [similar, setSimilar] = useState(null);
  const [perfumeName, setPerfumeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!perfume) {
      setSimilar(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    setSimilar(null);
    const params = maxPrice ? `?max_price=${maxPrice}` : "";
    api
      .get(`/api/similar/${perfume.id}/${params}`)
      .then((res) => {
        setSimilar(res.data.similar);
        setPerfumeName(res.data.perfume_name);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Could not find similar fragrances.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [perfume, maxPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">AI Feature</p>
        <h1 className="text-5xl font-serif text-rose-900 mb-4">Find Similar Fragrances</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Pick a fragrance and discover the top 5 most similar scents from our collection.
        </p>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Search */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-400 mb-4 text-center">
            Choose a fragrance
          </p>
          <PerfumeSearch selected={perfume} onSelect={setPerfume} />

          <div className="mt-5 flex items-center justify-center gap-3">
            <label className="text-xs uppercase tracking-[0.25em] text-rose-400">
              Max price ($)
            </label>
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 border border-rose-200 rounded-2xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-10 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-rose-100 rounded w-1/2" />
                    <div className="h-3 bg-rose-50 rounded w-1/3" />
                  </div>
                  <div className="w-10 h-5 bg-rose-100 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-8 text-sm text-rose-500 text-center">{error}</p>
          )}

          {/* Results */}
          {similar && similar.length > 0 && (
            <div className="mt-10 pt-8 border-t border-rose-100">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-400 mb-5 text-center">
                Most similar to <span className="text-rose-700">{perfumeName}</span>
              </p>
              <ol className="space-y-3">
                {similar.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      to={`/perfumes/${p.id}`}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-rose-50 transition-colors group"
                    >
                      <span className="w-6 text-center text-sm font-serif text-rose-300 flex-shrink-0">
                        {i + 1}
                      </span>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-2xl border border-rose-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-rose-400 font-serif">{p.name[0]}</span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-rose-900 transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{p.brand?.name}</p>
                      </div>
                      <ScoreBadge score={p.score} />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SimilarPage;
