import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, X, Sparkles } from "lucide-react";

function PerfumeSearch({ label, selected, onSelect }) {
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
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api
        .get(`/api/perfumes/?search=${encodeURIComponent(query)}`)
        .then((res) => {
          const data = res.data.results || res.data;
          setResults(data.slice(0, 8));
        })
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
    <div className="flex-1 min-w-0" ref={ref}>
      <p className="text-xs uppercase tracking-[0.25em] text-rose-400 mb-2">{label}</p>

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
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-xl border border-rose-100 flex-shrink-0"
                    />
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

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#9f1239" : score >= 45 ? "#e11d48" : "#fda4af";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#ffe4e6" strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-bold text-rose-900">{score}</p>
        <p className="text-xs text-gray-400">/ 100</p>
      </div>
    </div>
  );
}

function CompatibilityPage() {
  const [perfumeA, setPerfumeA] = useState(null);
  const [perfumeB, setPerfumeB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canCheck = perfumeA && perfumeB && perfumeA.id !== perfumeB.id;

  function handleCheck() {
    if (!canCheck) return;
    setLoading(true);
    setError("");
    setResult(null);

    api
      .get(`/api/compatibility/${perfumeA.id}/${perfumeB.id}/`)
      .then((res) => setResult(res.data))
      .catch((err) => {
        const msg = err.response?.data?.error || "Could not compute compatibility.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }

  const labelColor =
    result?.score >= 55
      ? "text-rose-900 bg-rose-50 border-rose-200"
      : result?.score >= 40
      ? "text-rose-700 bg-rose-50 border-rose-200"
      : "text-gray-500 bg-gray-50 border-gray-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-3">AI Feature</p>
        <h1 className="text-5xl font-serif text-rose-900 mb-4">Fragrance Compatibility</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Discover how well two fragrances complement each other using our scent-matching model.
        </p>
      </section>

      {/* Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-8">
          {/* Search fields */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <PerfumeSearch
              label="First Fragrance"
              selected={perfumeA}
              onSelect={(p) => { setPerfumeA(p); setResult(null); setError(""); }}
            />

            <div className="flex-shrink-0 self-center pt-5 sm:pt-6">
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <span className="text-rose-400 text-sm font-serif">+</span>
              </div>
            </div>

            <PerfumeSearch
              label="Second Fragrance"
              selected={perfumeB}
              onSelect={(p) => { setPerfumeB(p); setResult(null); setError(""); }}
            />
          </div>

          {/* Same perfume warning */}
          {perfumeA && perfumeB && perfumeA.id === perfumeB.id && (
            <p className="mt-4 text-sm text-rose-500 text-center">
              Please select two different fragrances.
            </p>
          )}

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={handleCheck}
              disabled={!canCheck || loading}
              className="inline-flex items-center gap-2 bg-rose-900 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Checking..." : "Check Compatibility"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-6 text-sm text-rose-500 text-center">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="mt-10 pt-8 border-t border-rose-100 flex flex-col items-center gap-6">
              <ScoreRing score={result.score} />

              <div className="text-center">
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${labelColor}`}
                >
                  {result.label}
                </span>
                <p className="mt-3 text-gray-500 text-sm">
                  <span className="font-medium text-gray-700">{result.perfume_a}</span>
                  {" & "}
                  <span className="font-medium text-gray-700">{result.perfume_b}</span>
                </p>
              </div>

              <div className="w-full bg-rose-50 rounded-2xl p-4 text-sm text-gray-500 text-center">
                {result.score >= 55 && "These two fragrances share complementary scent profiles and layer beautifully together."}
                {result.score >= 40 && result.score < 55 && "These fragrances have moderate compatibility — they can work together with some overlap in notes."}
                {result.score < 40 && "These fragrances have contrasting profiles. They may clash when worn together."}
              </div>

              {perfumeA && perfumeB && (
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link
                    to={`/perfumes/${perfumeA.id}`}
                    className="text-sm text-rose-900 hover:text-rose-700 underline underline-offset-2 transition-colors"
                  >
                    View {perfumeA.name}
                  </Link>
                  <span className="text-gray-300">·</span>
                  <Link
                    to={`/perfumes/${perfumeB.id}`}
                    className="text-sm text-rose-900 hover:text-rose-700 underline underline-offset-2 transition-colors"
                  >
                    View {perfumeB.name}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CompatibilityPage;
