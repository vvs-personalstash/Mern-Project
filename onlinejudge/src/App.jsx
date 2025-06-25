import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./components/login";
import Dashboard from "./components/Dashboard";

function App() {
   return (
    <GoogleOAuthProvider clientId="398334627069-dfnfq05pn3lf9k2slr494otj0qj50d1b.apps.googleusercontent.com">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App
