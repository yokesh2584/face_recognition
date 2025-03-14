import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaDownload, FaSearch, FaCalendarAlt } from "react-icons/fa";

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchAttendanceData(selectedDate);
  }, [selectedDate]);

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/attendance?date=${date}`);
      setAttendanceData(response.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to fetch attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) return;

    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Role",
      "Date",
      "Check-in Time",
      "Check-out Time",
    ];
    const csvRows = [headers];

    attendanceData.forEach((record) => {
      const row = [
        record.user_name,
        record.user_email,
        record.user_role,
        record.date,
        record.checkin_time,
        record.checkout_time || "N/A",
      ];
      csvRows.push(row);
    });

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_${selectedDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="attendance-report">
      <h2 className="mb-4">Attendance Report</h2>

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Filter Options</h5>
        </div>
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-4">
              <label htmlFor="date" className="form-label">
                <FaCalendarAlt className="me-2" />
                Select Date
              </label>
              <input
                type="date"
                className="form-control"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary"
                onClick={() => fetchAttendanceData(selectedDate)}
              >
                <FaSearch className="me-2" />
                View Report
              </button>
            </div>
            <div className="col-md-4 text-md-end">
              <button
                className="btn btn-success"
                onClick={exportToCSV}
                disabled={attendanceData.length === 0}
              >
                <FaDownload className="me-2" />
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Attendance Data</h5>
          <span className="badge bg-light text-dark">
            {attendanceData.length} Records
          </span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading attendance data...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : attendanceData.length === 0 ? (
            <div className="alert alert-info">
              No attendance records found for the selected date.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Check-in Time</th>
                    <th>Check-out Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => {
                    // Calculate duration if check-out time exists
                    let duration = "N/A";
                    if (record.checkout_time) {
                      const checkIn = new Date(
                        `${record.date}T${record.checkin_time}`
                      );
                      const checkOut = new Date(
                        `${record.date}T${record.checkout_time}`
                      );
                      const diff = Math.abs(checkOut - checkIn) / 36e5; // Convert to hours
                      duration = `${diff.toFixed(2)} hrs`;
                    }

                    return (
                      <tr key={record.attendance_id || index}>
                        <td>{index + 1}</td>
                        <td>{record.user_name}</td>
                        <td>{record.user_email}</td>
                        <td>
                          <span
                            className={`badge ${
                              record.user_role === "student"
                                ? "bg-primary"
                                : record.user_role === "teacher"
                                ? "bg-success"
                                : record.user_role === "admin"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {record.user_role}
                          </span>
                        </td>
                        <td>{record.checkin_time}</td>
                        <td>{record.checkout_time || "Not checked out"}</td>
                        <td>{duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
