import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Scholarships from "./pages/Scholarships";
import About from "./pages/About";

function App() {
return ( <div className="app"> <nav className="navbar"> <div className="logo">
Tribal Scholarship System </div>


   <div className="nav-links">
  <Link to="/">Home</Link>
  <Link to="/scholarships">Scholarships</Link>
  <Link to="/about">About</Link>
</div>

  </nav>

  <main>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route
      path="/scholarships"
      element={<Scholarships />}
    />
    <Route path="/about" element={<About />} />
  </Routes>
</main>


  <footer className="footer">
    <p>
      © 2026 Tribal Scholarship System. All rights reserved.
    </p>
  </footer>
</div>


);
}

export default App;
