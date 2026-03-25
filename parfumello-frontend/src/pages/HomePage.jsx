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

  const perfumeImages = [
    "https://images.unsplash.com/photo-1770301410072-f6ef6dad65b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzM4MTA1NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1733235014618-eb4c22fabec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZXJmdW1lJTIwYm90dGxlcyUyMHBpbmt8ZW58MXx8fHwxNzczOTE4ODUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1769038937200-723ce34d83d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGZyYWdyYW5jZSUyMGJvdHRsZSUyMGdvbGR8ZW58MXx8fHwxNzczOTE4ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1676139412671-00742a9920a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwZmxvcmFsJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NzM5MTg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ];

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
        perfumeImages={perfumeImages}
        loading={loading}
        error={error}
      />
      <Footer />
    </div>
  );
}

export default HomePage;