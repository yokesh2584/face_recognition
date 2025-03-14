import React from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaCamera, FaClipboardList, FaHome } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <FaCamera className="me-2" />
          Face Recognition Attendance
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <FaHome className="me-1" /> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register">
                <FaUserPlus className="me-1" /> Register User
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/capture">
                <FaCamera className="me-1" /> Take Attendance
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/report">
                <FaClipboardList className="me-1" /> Attendance Report
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
