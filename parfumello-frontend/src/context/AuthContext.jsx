import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) return;
    api
      .get("/api/profile/")
      .then((res) => {
        const ids = res.data.favorite_perfumes?.map((p) => p.id) || [];
        setFavorites(ids);
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser.username) {
          const updated = { ...currentUser, profile_pic_url: res.data.profile_pic_url || null };
          localStorage.setItem("user", JSON.stringify(updated));
          setUser(updated);
        }
      })
      .catch(() => {});
  }, []);

  async function fetchAndStoreProfile(username) {
    try {
      const profileRes = await api.get("/api/profile/");
      const ids = profileRes.data.favorite_perfumes?.map((p) => p.id) || [];
      setFavorites(ids);
      const userData = { username, profile_pic_url: profileRes.data.profile_pic_url || null };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch {
      const userData = { username, profile_pic_url: null };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  }

  async function login(username, password) {
    const res = await api.post("/api/auth/token/", { username, password });
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setToken(access);
    await fetchAndStoreProfile(username);
  }

  async function refreshProfile() {
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser?.username) return;
    await fetchAndStoreProfile(currentUser.username);
  }

  async function toggleFavorite(perfumeId) {
    const isFav = favorites.includes(perfumeId);
    const url = isFav ? "/api/profile/remove_favorite/" : "/api/profile/add_favorite/";
    try {
      await api.post(url, { perfume_id: perfumeId });
      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== perfumeId) : [...prev, perfumeId]
      );
    } catch (e) {
      console.error(e);
    }
  }

  function updateUsername(newUsername) {
    setUser((prev) => {
      const updated = { ...prev, username: newUsername };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }

  async function register(username, email, password, password2) {
    await api.post("/api/auth/register/", { username, email, password, password2 });
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setFavorites([]);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, refreshProfile, updateUsername, favorites, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
