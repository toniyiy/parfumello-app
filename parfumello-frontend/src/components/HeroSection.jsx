function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-serif text-rose-900 mb-6">
            Discover Your Signature Scent
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our curated collection of premium fragrances from around the world
          </p>
          <button className="bg-rose-900 text-white px-8 py-3 rounded-full hover:bg-rose-800 transition-colors shadow-lg hover:shadow-xl">
            Shop Collection
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;