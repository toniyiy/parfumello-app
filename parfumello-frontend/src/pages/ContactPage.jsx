import { useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ContactPage() {
  const TYPES = [
    { value: "question", label: "Question" },
    { value: "suggestion", label: "Suggestion" },
    { value: "just-talking", label: "Just talking" },
  ];

  const [form, setForm] = useState({ name: "", email: "", message: "", type: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/contact/", form);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-4">Get in touch</p>
        <h1 className="text-5xl font-serif text-rose-900 mb-4">Contact Us</h1>
        <p className="text-gray-500 leading-relaxed">
          Have a question, a suggestion, or just want to talk fragrance? We'd love to hear from you.
        </p>
      </section>

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
        {submitted ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">💌</span>
            </div>
            <h2 className="text-2xl font-serif text-rose-900 mb-3">Message sent!</h2>
            <p className="text-gray-500">Thanks for reaching out. We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Type</label>
              <div className="flex gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`flex-1 py-2.5 rounded-full text-sm border transition-colors ${
                      form.type === t.value
                        ? "bg-rose-900 text-white border-rose-900"
                        : "bg-white text-gray-600 border-rose-200 hover:border-rose-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="What's on your mind?"
                className="w-full border border-rose-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-900 text-white py-3 rounded-full hover:bg-rose-800 transition-colors text-sm tracking-wide disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
