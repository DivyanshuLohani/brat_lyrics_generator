import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#8ace00] p-5 font-mono selection:bg-black selection:text-white">
        <div className="max-w-225 mx-auto bg-white border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8">
          <header className="flex justify-between items-center mb-8">
            <Link to="/" className="text-decoration-none">
              <h1 className="text-5xl font-bold tracking-tighter italic blur-[0.5px] m-0">
                brat generator
              </h1>
            </Link>
            <Link to="/history" className="text-black font-bold hover:underline">
              [HISTORY]
            </Link>
          </header>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
