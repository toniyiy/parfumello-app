import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.password2);
      await login(form.username, form.password);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat();
        setError(messages[0] || "Registration failed.");
      } else {
        setError("Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      <main className="max-w-md mx-auto px-6 py-24">
        <div className="bg-white rounded-3xl shadow-lg border border-rose-100 p-10">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500 mb-8">Join Parfumello and start exploring fragrances.</p>

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
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900"
                placeholder="your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                name="password2"
                value={form.password2}
                onChange={handleChange}
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-900 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default RegisterPage;
