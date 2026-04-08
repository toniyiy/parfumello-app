import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      <main className="max-w-md mx-auto px-6 py-24">
        <div className="bg-white rounded-3xl shadow-lg border border-rose-100 p-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your Parfumello account.</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900"
                placeholder="your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-900 text-white py-3 rounded-full hover:bg-rose-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-rose-900 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;
