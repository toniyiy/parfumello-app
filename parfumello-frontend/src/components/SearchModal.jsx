import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      axios
        .get(`http://127.0.0.1:8000/api/perfumes/?search=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data.results || res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(perfume) {
    navigate(`/perfumes/${perfume.id}`);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-rose-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search perfumes, brands, notes..."
            className="flex-1 text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
          />
          <button onClick={onClose} className="p-1 hover:bg-rose-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {loading && (
            <p className="text-center text-gray-400 py-8">Searching...</p>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <p className="text-center text-gray-400 py-8">No results for "{query}"</p>
          )}

          {!loading && results.length > 0 && (
            <ul>
              {results.map((perfume) => (
                <li key={perfume.id}>
                  <button
                    onClick={() => handleSelect(perfume)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-50 transition-colors text-left"
                  >
                    <img
                      src={perfume.image_url || "/placeholder.jpg"}
                      alt={perfume.name}
                      className="w-12 h-12 object-cover rounded-xl border border-rose-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{perfume.name}</p>
                      <p className="text-sm text-gray-500">{perfume.brand?.name}</p>
                    </div>
                    <span className="text-rose-900 font-semibold flex-shrink-0">
                      ${perfume.price}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query.trim() && (
            <p className="text-center text-gray-400 py-8">Start typing to search...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
