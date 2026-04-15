import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400 mb-4">Our Story</p>
        <h1 className="text-5xl font-serif text-rose-900 mb-6 leading-tight">
          A passion for scent,<br />crafted into an experience.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Parfumello was born from a simple idea: that the right fragrance can define a moment,
          a memory, a version of yourself. We curate the world's finest perfumes so you can
          find the one that's unmistakably yours.
        </p>
      </section>

      {/* Divider image strip */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent mb-20" />

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🌹</span>
            </div>
            <h3 className="font-serif text-xl text-rose-900 mb-3">Curated Selection</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every fragrance in our catalogue is hand-picked by enthusiasts who believe
              scent is an art form, not just a product.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-serif text-xl text-rose-900 mb-3">Authenticity First</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We source directly from brands and authorised distributors. What you see
              is exactly what you get — genuine, sealed, and perfect.
            </p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">💌</span>
            </div>
            <h3 className="font-serif text-xl text-rose-900 mb-3">Personal Touch</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              From thoughtful packaging to a team that genuinely cares, we treat every
              order as a gift worth remembering.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-28">
        <h2 className="text-3xl font-serif text-rose-900 mb-4">Ready to find your scent?</h2>
        <p className="text-gray-500 mb-8">
          Explore our collection and discover a fragrance that feels like you.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-rose-900 text-white px-10 py-3 rounded-full hover:bg-rose-800 transition-colors text-sm tracking-wide"
        >
          Shop Now
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
