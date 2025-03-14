import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUserPlus, FaCamera, FaClipboardList, FaUsers } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayAttendance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get all users
        const usersResponse = await axios.get("http://localhost:5000/api/users");

        // Get today's attendance
        const today = new Date().toISOString().split("T")[0];
        const attendanceResponse = await axios.get(
          `http://localhost:5000/api/attendance?date=${today}`
        );

        setStats({
          totalUsers: usersResponse.data.users.length,
          todayAttendance: attendanceResponse.data.attendance.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="mb-4">Face Recognition Attendance System</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title">
                <FaUsers className="me-2" />
                Total Registered Users
              </h5>
              <p className="card-text display-4">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-light">
            <div className="card-body">
              <h5 className="card-title">
                <FaClipboardList className="me-2" />
                Today's Attendance
              </h5>
              <p className="card-text display-4">{stats.todayAttendance}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <FaUserPlus className="display-1 mb-3 text-primary" />
              <h5 className="card-title">Register New User</h5>
              <p className="card-text">
                Add new users to the face recognition system
              </p>
              <Link to="/register" className="btn btn-primary">
                Register User
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <FaCamera className="display-1 mb-3 text-success" />
              <h5 className="card-title">Take Attendance</h5>
              <p className="card-text">
                Capture attendance using face recognition
              </p>
              <Link to="/capture" className="btn btn-success">
                Capture
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <FaClipboardList className="display-1 mb-3 text-info" />
              <h5 className="card-title">Attendance Reports</h5>
              <p className="card-text">View and export attendance reports</p>
              <Link to="/report" className="btn btn-info">
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
