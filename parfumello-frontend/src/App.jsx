import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PerfumeDetail from "./pages/PerfumeDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/perfumes/:id" element={<PerfumeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;