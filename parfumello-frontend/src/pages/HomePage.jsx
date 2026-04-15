import { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import PerfumeGrid from "../components/PerfumeGrid";
import Footer from "../components/Footer";

function HomePage() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/perfumes/")
      .then((response) => {
        setPerfumes(response.data.results || response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load perfumes.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar />
      <HeroSection />
      <PerfumeGrid
        perfumes={perfumes}
        loading={loading}
        error={error}
      />
      <Footer />
    </div>
  );
}

export default HomePage;