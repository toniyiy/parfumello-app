import { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  const [shopOpen, setShopOpen] = useState(false);
  const [mensPerfumes, setMensPerfumes] = useState([]);
  const [womensPerfumes, setWomensPerfumes] = useState([]);

  const perfumeImages = [
    "https://images.unsplash.com/photo-1770301410072-f6ef6dad65b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzM4MTA1NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1733235014618-eb4c22fabec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZXJmdW1lJTIwYm90dGxlcyUyMHBpbmt8ZW58MXx8fHwxNzczOTE4ODUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1769038937200-723ce34d83d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGZyYWdyYW5jZSUyMGJvdHRsZSUyMGdvbGR8ZW58MXx8fHwxNzczOTE4ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1676139412671-00742a9920a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwZmxvcmFsJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzM5MTg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ];

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const getFallbackImage = (id) => {
    return perfumeImages[(id - 1) % perfumeImages.length];
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/perfumes/")
      .then((res) => {
        const data = res.data.results || res.data;

        const men = shuffleArray(
          data.filter((perfume) => perfume.sex?.toLowerCase() === "male")
        ).slice(0, 2);

        const women = shuffleArray(
          data.filter((perfume) => perfume.sex?.toLowerCase() === "female")
        ).slice(0, 2);

        setMensPerfumes(men);
        setWomensPerfumes(women);
      })
      .catch((err) => {
        console.error("Failed to fetch perfumes for navbar dropdown:", err);
      });
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-serif text-rose-900">
              <Link to="/" className="hover:text-rose-800 transition-colors">
                Parfumello
              </Link>
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 hover:text-rose-900 transition-colors">
                Shop
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {shopOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4">
                  <div className="w-[820px] rounded-3xl border border-rose-100 bg-white/95 backdrop-blur-xl shadow-2xl p-8 grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-rose-500 mb-4">
                        Shop
                      </p>

                      <div className="flex flex-col gap-3">
                        <Link
                          to="/shop"
                          className="text-gray-800 hover:text-rose-900 transition-colors"
                        >
                          All Perfumes
                        </Link>
                        <Link
                          to="/shop/men"
                          className="text-gray-800 hover:text-rose-900 transition-colors"
                        >
                          Men&apos;s Perfumes
                        </Link>
                        <Link
                          to="/shop/women"
                          className="text-gray-800 hover:text-rose-900 transition-colors"
                        >
                          Women&apos;s Perfumes
                        </Link>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-4">
                        Men&apos;s Picks
                      </p>

                      <div className="space-y-4">
                        {mensPerfumes.length > 0 ? (
                          mensPerfumes.map((perfume) => (
                            <Link
                              key={perfume.id}
                              to={`/perfumes/${perfume.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <img
                                src={perfume.image || getFallbackImage(perfume.id)}
                                alt={perfume.name}
                                className="w-16 h-16 object-cover rounded-2xl border border-rose-100"
                              />
                              <div>
                                <p className="text-gray-900 group-hover:text-rose-900 transition-colors">
                                  {perfume.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {perfume.brand?.name || "Unknown brand"}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No men&apos;s perfumes yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-4">
                        Women&apos;s Picks
                      </p>

                      <div className="space-y-4">
                        {womensPerfumes.length > 0 ? (
                          womensPerfumes.map((perfume) => (
                            <Link
                              key={perfume.id}
                              to={`/perfumes/${perfume.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <img
                                src={perfume.image || getFallbackImage(perfume.id)}
                                alt={perfume.name}
                                className="w-16 h-16 object-cover rounded-2xl border border-rose-100"
                              />
                              <div>
                                <p className="text-gray-900 group-hover:text-rose-900 transition-colors">
                                  {perfume.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {perfume.brand?.name || "Unknown brand"}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No women&apos;s perfumes yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-gray-700 hover:text-rose-900 transition-colors"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="text-gray-700 hover:text-rose-900 transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-rose-50 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            <button className="p-2 hover:bg-rose-50 rounded-full transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </button>

            <button className="p-2 hover:bg-rose-50 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;