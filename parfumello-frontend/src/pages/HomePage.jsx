import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import PerfumeGrid from "../components/PerfumeGrid";
import Footer from "../components/Footer";

function HomePage() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/perfumes/")
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