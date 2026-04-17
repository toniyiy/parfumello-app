import { useEffect, useState, useRef } from "react";
import api from "../api";
import { Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import SearchModal from "./SearchModal";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [shopOpen, setShopOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [mensPerfumes, setMensPerfumes] = useState([]);
  const [womensPerfumes, setWomensPerfumes] = useState([]);
  const [unisexPerfumes, setUnisexPerfumes] = useState([]);

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    api.get("/api/brands/top/")
      .then((res) => setBrands(res.data.results || res.data))
      .catch((err) => console.error("Failed to fetch brands:", err));
  }, []);

  useEffect(() => {
    api
      .get("/api/perfumes/")
      .then((res) => {
        const data = res.data.results || res.data;

        const men = shuffleArray(
          data.filter((perfume) => perfume.sex?.toLowerCase() === "male")
        ).slice(0, 2);

        const women = shuffleArray(
          data.filter((perfume) => perfume.sex?.toLowerCase() === "female")
        ).slice(0, 2);

        const unisex = shuffleArray(
          data.filter((perfume) => perfume.sex?.toLowerCase() === "unisex")
        ).slice(0, 2);

        setMensPerfumes(men);
        setWomensPerfumes(women);
        setUnisexPerfumes(unisex);
      })
      .catch((err) => {
        console.error("Failed to fetch perfumes:", err);
      });
  }, []);

  return (
    <>
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
                          to="/shop/new"
                          className="text-rose-500 font-medium hover:text-rose-700 transition-colors"
                        >
                          ✦ New Arrivals
                        </Link>
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
                        <Link
                          to="/shop/unisex"
                          className="text-gray-800 hover:text-rose-900 transition-colors"
                        >
                          Unisex Perfumes
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
                                src={perfume.image_url || "/placeholder.jpg"}
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
                                src={perfume.image_url || "/placeholder.jpg"}
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

            <div
              className="relative"
              onMouseEnter={() => setBrandsOpen(true)}
              onMouseLeave={() => setBrandsOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 hover:text-rose-900 transition-colors">
                Brands
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${brandsOpen ? "rotate-180" : ""}`} />
              </button>

              {brandsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4">
                  <div className="min-w-[220px] rounded-3xl border border-rose-100 bg-white/95 backdrop-blur-xl shadow-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-400 mb-3 px-3">Top Houses</p>
                    {brands.length === 0 ? (
                      <p className="text-sm text-gray-400 px-3">No data yet.</p>
                    ) : (
                      <div className="flex flex-col gap-1 mb-3">
                        {brands.map((brand) => (
                          <Link
                            key={brand.id}
                            to={`/brands/${brand.id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-rose-50 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-contain rounded-lg border border-rose-100 bg-white p-0.5" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-xs font-serif text-rose-400">
                                {brand.name[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-gray-800 group-hover:text-rose-900 transition-colors text-sm font-medium">{brand.name}</p>
                              {brand.country && <p className="text-xs text-gray-400">{brand.country}</p>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-rose-100 pt-3 px-3">
                      <Link
                        to="/brands"
                        className="text-sm text-rose-900 hover:text-rose-700 transition-colors font-medium"
                      >
                        Browse all houses →
                      </Link>
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
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-rose-50 rounded-full transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-rose-200 hover:border-rose-400 transition-colors focus:outline-none"
                  title={user.username}
                >
                  {user.profile_pic_url ? (
                    <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-rose-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-rose-500" />
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-lg border border-rose-100 py-2 z-50">
                    <p className="px-4 py-1 text-xs text-gray-400 truncate">{user.username}</p>
                    <hr className="border-rose-100 my-1" />
                    <Link
                      to="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); navigate("/"); setProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 hover:bg-rose-50 rounded-full transition-colors"
                title="Sign in"
              >
                <User className="w-5 h-5 text-gray-700" />
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="p-2 hover:bg-rose-50 rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </nav>

    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;