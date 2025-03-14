import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { FaCamera, FaCheck, FaTimes, FaSync } from "react-icons/fa";

const AttendanceCapture = () => {
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [recentAttendance, setRecentAttendance] = useState([]);

  const webcamRef = useRef(null);

  // Fetch recent attendance on component mount
  useEffect(() => {
    fetchRecentAttendance();
  }, []);

  const fetchRecentAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(`http://localhost:5000/api/attendance?date=${today}`);
      setRecentAttendance(response.data.attendance.slice(0, 5)); // Get last 5 records
    } catch (error) {
      console.error("Error fetching recent attendance:", error);
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCapturing(false);
    setRecognitionResult(null);
    setMessage({ text: "", type: "" });
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setIsCapturing(true);
    setRecognitionResult(null);
    setMessage({ text: "", type: "" });
  };

  const recognizeFace = async () => {
    if (!capturedImage) {
      setMessage({ text: "Please capture an image first", type: "danger" });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/recognize", {
        image: capturedImage,
      });

      if (response.data.recognized) {
        setRecognitionResult(response.data);
        setMessage({
          text: `Attendance marked for ${response.data.user.name}`,
          type: "success",
        });

        // Refresh recent attendance
        fetchRecentAttendance();
      } else {
        setMessage({
          text: "Face not recognized. Please try again or register the user.",
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Recognition error:", error);
      if (error.response?.status === 404) {
        setMessage({
          text: "Face not recognized. Please try again or register the user.",
          type: "warning",
        });
      } else {
        setMessage({
          text: error.response?.data?.error || "Failed to process recognition",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-capture">
      <h2 className="mb-4">Attendance Capture</h2>

      <div className="row">
        <div className="col-md-7">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Face Recognition</h5>
            </div>
            <div className="card-body text-center">
              {isCapturing ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 480,
                      height: 360,
                      facingMode: "user",
                    }}
                    className="mb-3 border"
                    style={{ width: "100%", height: "auto" }}
                  />
                  <button
                    onClick={captureImage}
                    className="btn btn-success btn-lg"
                  >
                    <FaCamera className="me-2" />
                    Capture Image
                  </button>
                </>
              ) : (
                <>
                  {capturedImage && (
                    <div className="mb-3">
                      <img
                        src={capturedImage || "/placeholder.svg"}
                        alt="Captured face"
                        className="border"
                        style={{ width: "100%", height: "auto" }}
                      />
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-2 mb-3">
                    <button
                      onClick={resetCapture}
                      className="btn btn-secondary"
                    >
                      <FaSync className="me-2" />
                      Retake
                    </button>

                    <button
                      onClick={recognizeFace}
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheck className="me-2" />
                          Recognize Face
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {message.text && (
                <div className={`alert alert-${message.type} mt-3`}>
                  {message.text}
                </div>
              )}

              {recognitionResult && (
                <div className="mt-3 p-3 border rounded bg-light">
                  {/* {console.log("RecognitionResult: ", recognitionResult)} */}
                  <h5>Recognition Result:</h5>
                  <p>
                    <strong>Name:</strong> {recognitionResult.user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {recognitionResult.user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {recognitionResult.user.role}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(recognitionResult.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Recent Attendance</h5>
            </div>
            <div className="card-body">
              {recentAttendance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((record, index) => (
                        <tr key={index}>
                          <td>{record.user_name}</td>
                          <td>{record.checkin_time}</td>
                          <td>
                            <span className="badge bg-success">Present</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted">
                  No attendance records for today
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCapture;

// import React, { useState, useRef, useEffect } from "react";
// import Webcam from "react-webcam";
// import axios from "axios";
// import { FaCamera, FaCheck, FaSync } from "react-icons/fa";

// const AttendanceCapture = () => {
//   const [capturedImages, setCapturedImages] = useState([]); // Store multiple images
//   const [recognitionResult, setRecognitionResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [recentAttendance, setRecentAttendance] = useState([]);

//   const webcamRef = useRef(null);

//   // Fetch recent attendance on component mount
//   useEffect(() => {
//     fetchRecentAttendance();
//   }, []);

//   const fetchRecentAttendance = async () => {
//     try {
//       const today = new Date().toISOString().split("T")[0];
//       const response = await axios.get(
//         `http://localhost:5000/api/attendance?date=${today}`
//       );
//       setRecentAttendance(response.data.attendance.slice(0, 5)); // Get last 5 records
//     } catch (error) {
//       console.error("Error fetching recent attendance:", error);
//     }
//   };

//   const captureImage = () => {
//     if (capturedImages.length < 5) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       setCapturedImages([...capturedImages, imageSrc]);
//     }
//   };

//   const resetCapture = () => {
//     setCapturedImages([]);
//     setRecognitionResult(null);
//     setMessage({ text: "", type: "" });
//   };

//   const recognizeFace = async () => {
//     if (capturedImages.length < 5) {
//       setMessage({ text: "Please capture at least 5 images", type: "danger" });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post("http://localhost:5000/api/recognize", {
//         images: capturedImages,
//       });

//       if (response.data.recognized) {
//         setRecognitionResult(response.data);
//         setMessage({
//           text: `Attendance marked for ${response.data.user.name}`,
//           type: "success",
//         });

//         fetchRecentAttendance();
//       } else {
//         setMessage({
//           text: "Face not recognized. Please try again or register the user.",
//           type: "warning",
//         });
//       }
//     } catch (error) {
//       console.error("Recognition error:", error);
//       setMessage({
//         text: error.response?.data?.error || "Failed to process recognition",
//         type: "danger",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="attendance-capture">
//       <h2 className="mb-4">Attendance Capture</h2>

//       <div className="row">
//         <div className="col-md-7">
//           <div className="card mb-4">
//             <div className="card-header bg-primary text-white">
//               <h5 className="mb-0">Face Recognition</h5>
//             </div>
//             <div className="card-body text-center">
//               <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 videoConstraints={{
//                   width: 480,
//                   height: 360,
//                   facingMode: "user",
//                 }}
//                 className="mb-3 border w-100"
//               />

//               <div className="mb-3">
//                 <button
//                   onClick={captureImage}
//                   className="btn btn-success me-2"
//                   disabled={capturedImages.length >= 5}
//                 >
//                   <FaCamera className="me-2" />
//                   Capture ({capturedImages.length}/5)
//                 </button>
//                 <button onClick={resetCapture} className="btn btn-secondary">
//                   <FaSync className="me-2" />
//                   Reset
//                 </button>
//               </div>

//               <div className="d-flex flex-wrap justify-content-center">
//                 {capturedImages.map((img, index) => (
//                   <img
//                     key={index}
//                     src={img}
//                     alt={`Captured ${index + 1}`}
//                     className="border rounded m-1"
//                     style={{ width: "70px", height: "70px" }}
//                   />
//                 ))}
//               </div>

//               <button
//                 onClick={recognizeFace}
//                 className="btn btn-primary mt-3"
//                 disabled={loading || capturedImages.length < 5}
//               >
//                 {loading ? (
//                   <>
//                     <span
//                       className="spinner-border spinner-border-sm me-2"
//                       role="status"
//                       aria-hidden="true"
//                     ></span>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <FaCheck className="me-2" />
//                     Recognize Face
//                   </>
//                 )}
//               </button>

//               {message.text && (
//                 <div className={`alert alert-${message.type} mt-3`}>
//                   {message.text}
//                 </div>
//               )}

//               {recognitionResult && (
//                 <div className="mt-3 p-3 border rounded bg-light">
//                   <h5>Recognition Result:</h5>
//                   <p>
//                     <strong>Name:</strong> {recognitionResult.user.name}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {recognitionResult.user.email}
//                   </p>
//                   <p>
//                     <strong>Role:</strong> {recognitionResult.user.role}
//                   </p>
//                   <p>
//                     <strong>Time:</strong>{" "}
//                     {new Date(recognitionResult.timestamp).toLocaleTimeString()}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="col-md-5">
//           <div className="card">
//             <div className="card-header bg-primary text-white">
//               <h5 className="mb-0">Recent Attendance</h5>
//             </div>
//             <div className="card-body">
//               {recentAttendance.length > 0 ? (
//                 <div className="table-responsive">
//                   <table className="table table-striped">
//                     <thead>
//                       <tr>
//                         <th>Name</th>
//                         <th>Time</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recentAttendance.map((record, index) => (
//                         <tr key={index}>
//                           <td>{record.user_name}</td>
//                           <td>{record.checkin_time}</td>
//                           <td>
//                             <span className="badge bg-success">Present</span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <p className="text-center text-muted">
//                   No attendance records for today
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AttendanceCapture;
