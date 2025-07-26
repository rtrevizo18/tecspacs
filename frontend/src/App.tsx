import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import ViewSnippet from "./pages/ViewSnippet";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view/:id" element={<ViewSnippet />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
