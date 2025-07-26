import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import ViewSnippet from "./pages/ViewSnippet";
import AuthCarousel from "./components/AuthCarousel";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view/:id" element={<ViewSnippet />} />
          <Route path="/auth" element={<AuthCarousel />} />
          <Route path="/login" element={<AuthCarousel />} />
          <Route path="/register" element={<AuthCarousel />} />
          <Route path="/reset-password" element={<AuthCarousel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
