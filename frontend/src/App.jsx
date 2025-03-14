import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./App.css";

// Import components
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import RegisterUser from "./pages/RegisterUser";
import AttendanceCapture from "./pages/AttendanceCapture";
import AttendanceReport from "./pages/AttendanceReport";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/capture" element={<AttendanceCapture />} />
            <Route path="/report" element={<AttendanceReport />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
