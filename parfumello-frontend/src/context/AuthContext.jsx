import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(username, password) {
    const res = await axios.post("http://127.0.0.1:8000/api/auth/token/", {
      username,
      password,
    });
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify({ username }));
    setToken(access);
    setUser({ username });
  }

  async function register(username, email, password, password2) {
    await axios.post("http://127.0.0.1:8000/api/auth/register/", {
      username,
      email,
      password,
      password2,
    });
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
