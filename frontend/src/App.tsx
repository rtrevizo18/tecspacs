import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import Navigation from "./components/Navigation";
import { usePenCursor } from "./hooks/usePenCursor";
import Dashboard from "./pages/Dashboard";
import ViewSnippet from "./pages/ViewSnippet";
import UserProfile from "./pages/UserProfile";
import NewSnippet from "./pages/NewSnippet";
import NewTEC from "./pages/NewTEC";
import NewPAC from "./pages/NewPAC";
import ViewPAC from "./pages/ViewPAC";
import EditSnippet from "./pages/EditSnippet";
import EditTEC from "./pages/EditTEC";
import EditPAC from "./pages/EditPAC";
import AuthCarousel from "./components/AuthCarousel";
import Callback from "./pages/Callback";
import SetupProfile from "./pages/SetupProfile";
import { auth0Config } from "./config/auth0";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  // Apply pen cursor to the entire app
  usePenCursor();

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
        scope: "openid profile email"
      }}
    >
      <AuthProvider>
        <ToastProvider>
          <Router>
          <div className="App">
            <Navigation />
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/view/:id" element={<ViewSnippet />} />
            <Route path="/view-pac/:id" element={<ViewPAC />} />
            <Route path="/user/:uid" element={<UserProfile />} />
            <Route path="/new" element={<NewSnippet />} />
            <Route path="/new-tec" element={<NewTEC />} />
            <Route path="/new-pac" element={<NewPAC />} />
            <Route path="/edit/:id" element={<EditSnippet />} />
            <Route path="/edit-tec/:id" element={<EditTEC />} />
            <Route path="/edit-pac/:id" element={<EditPAC />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/setup-profile" element={<SetupProfile />} />
            <Route path="/auth" element={<AuthCarousel />} />
            <Route path="/login" element={<AuthCarousel />} />
            <Route path="/register" element={<AuthCarousel />} />
            <Route path="/reset-password" element={<AuthCarousel />} />
          </Routes>
          </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;
