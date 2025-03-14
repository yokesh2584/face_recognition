import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { FaCamera, FaUndo, FaSave } from "react-icons/fa";

const RegisterUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "student", // Default role
  });

  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const startCapture = () => {
    setIsCapturing(true);
    setCapturedImage(null);
    setMessage({ text: "", type: "" });
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCapturing(false);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setIsCapturing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!capturedImage) {
      setMessage({ text: "Please capture an image first", type: "danger" });
      return;
    }

    if (!userData.name || !userData.email) {
      setMessage({ text: "Name and email are required", type: "danger" });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        ...userData,
        image: capturedImage,
      });

      setMessage({
        text: `User registered successfully with ID: ${response.data.user_id}`,
        type: "success",
      });

      // Reset form
      setUserData({ name: "", email: "", role: "student" });
      setCapturedImage(null);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        text: error.response?.data?.error || "Failed to register user",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-user">
      <h2 className="mb-4">Register New User</h2>

      {message.text && (
        <div className={`alert alert-${message.type} mb-4`}>{message.text}</div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">User Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={userData.role}
                    onChange={handleInputChange}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !capturedImage}
                >
                  <FaSave className="me-2" />
                  {loading ? "Registering..." : "Register User"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Capture Face</h5>
            </div>
            <div className="card-body text-center">
              {isCapturing ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 320,
                      height: 240,
                      facingMode: "user",
                    }}
                    className="mb-3 border"
                    style={{ width: "100%", height: "auto" }}
                  />
                  <button onClick={captureImage} className="btn btn-success">
                    <FaCamera className="me-2" />
                    Capture Photo
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
                  <button onClick={resetCapture} className="btn btn-secondary">
                    <FaUndo className="me-2" />
                    Retake Photo
                  </button>
                </>
              )}

              <div className="mt-3 text-muted">
                <small>
                  Please ensure the face is clearly visible and well-lit. Look
                  directly at the camera for best results.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;

// import React, { useState, useRef } from "react";
// import Webcam from "react-webcam";
// import axios from "axios";
// import { FaCamera, FaUndo, FaSave } from "react-icons/fa";

// const RegisterUser = () => {
//   const [userData, setUserData] = useState({
//     name: "",
//     email: "",
//     role: "student",
//   });
//   const [capturedImages, setCapturedImages] = useState([]); // Store multiple images
//   const [isCapturing, setIsCapturing] = useState(true);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [loading, setLoading] = useState(false);
//   const webcamRef = useRef(null);

//   const handleInputChange = (e) =>
//     setUserData({ ...userData, [e.target.name]: e.target.value });

//   const captureImage = () => {
//     if (capturedImages.length < 5) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       setCapturedImages([...capturedImages, imageSrc]);
//     }
//   };

//   const resetCapture = () => setCapturedImages([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (capturedImages.length < 5) {
//       setMessage({ text: "Please capture at least 5 images", type: "danger" });
//       return;
//     }

//     if (!userData.name || !userData.email) {
//       setMessage({ text: "Name and email are required", type: "danger" });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post("/api/register", {
//         ...userData,
//         images: capturedImages,
//       });

//       setMessage({
//         text: `User registered successfully with ID: ${response.data.user_id}`,
//         type: "success",
//       });
//       setUserData({ name: "", email: "", role: "student" });
//       setCapturedImages([]);
//     } catch (error) {
//       setMessage({
//         text: error.response?.data?.error || "Failed to register user",
//         type: "danger",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="register-user">
//       <h2>Register New User</h2>

//       {message.text && (
//         <div className={`alert alert-${message.type}`}>{message.text}</div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="name"
//           value={userData.name}
//           onChange={handleInputChange}
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           value={userData.email}
//           onChange={handleInputChange}
//           required
//         />
//         <button type="submit" disabled={loading || capturedImages.length < 5}>
//           <FaSave /> Register
//         </button>
//       </form>

//       <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
//       <button onClick={captureImage} disabled={capturedImages.length >= 5}>
//         <FaCamera /> Capture
//       </button>
//       <button onClick={resetCapture}>
//         <FaUndo /> Reset
//       </button>

//       {capturedImages.map((img, index) => (
//         <img key={index} src={img} alt="Captured" />
//       ))}
//     </div>
//   );
// };

// export default RegisterUser;

// import React, { useState, useRef } from "react";
// import Webcam from "react-webcam";
// import axios from "axios";
// import { FaCamera, FaUndo, FaSave } from "react-icons/fa";

// const RegisterUser = () => {
//   const [userData, setUserData] = useState({
//     name: "",
//     email: "",
//     role: "student",
//   });
//   const [capturedImages, setCapturedImages] = useState([]); // Store multiple images
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [loading, setLoading] = useState(false);
//   const webcamRef = useRef(null);

//   const handleInputChange = (e) =>
//     setUserData({ ...userData, [e.target.name]: e.target.value });

//   const captureImage = () => {
//     if (capturedImages.length < 10) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       setCapturedImages([...capturedImages, imageSrc]);
//     }
//   };

//   const resetCapture = () => setCapturedImages([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (capturedImages.length < 10) {
//       setMessage({ text: "Please capture at least 10 images", type: "danger" });
//       return;
//     }

//     if (!userData.name || !userData.email) {
//       setMessage({ text: "Name and email are required", type: "danger" });
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post("http://localhost:5000/api/register", {
//         ...userData,
//         images: capturedImages,
//       });

//       setMessage({
//         text: `User registered successfully with ID: ${response.data.user_id}`,
//         type: "success",
//       });
//       setUserData({ name: "", email: "", role: "student" });
//       setCapturedImages([]);
//     } catch (error) {
//       setMessage({
//         text: error.response?.data?.error || "Failed to register user",
//         type: "danger",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="register-user">
//       <h2 className="mb-4">Register New User</h2>

//       {message.text && (
//         <div className={`alert alert-${message.type} mb-3`}>{message.text}</div>
//       )}

//       <form onSubmit={handleSubmit} className="mb-3">
//         <div className="mb-3">
//           <label htmlFor="name" className="form-label">
//             Full Name
//           </label>
//           <input
//             type="text"
//             className="form-control"
//             id="name"
//             name="name"
//             value={userData.name}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label htmlFor="email" className="form-label">
//             Email Address
//           </label>
//           <input
//             type="email"
//             className="form-control"
//             id="email"
//             name="email"
//             value={userData.email}
//             onChange={handleInputChange}
//             required
//           />
//         </div>

//         <div className="mb-3">
//           <label htmlFor="role" className="form-label">
//             Role
//           </label>
//           <select
//             className="form-select"
//             id="role"
//             name="role"
//             value={userData.role}
//             onChange={handleInputChange}
//           >
//             <option value="student">Student</option>
//             <option value="teacher">Teacher</option>
//             <option value="staff">Staff</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="btn btn-primary"
//           disabled={loading || capturedImages.length < 10}
//         >
//           <FaSave className="me-2" />
//           {loading ? "Registering..." : "Register User"}
//         </button>
//       </form>

//       <div className="card p-3">
//         <h5 className="text-center">Capture Face</h5>
//         <Webcam
//           audio={false}
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
//           className="mb-3 border w-100"
//         />

//         <div className="text-center">
//           <button
//             onClick={captureImage}
//             className="btn btn-success me-2"
//             disabled={capturedImages.length >= 10}
//           >
//             <FaCamera className="me-2" />
//             Capture ({capturedImages.length}/10)
//           </button>
//           <button onClick={resetCapture} className="btn btn-secondary">
//             <FaUndo className="me-2" />
//             Reset
//           </button>
//         </div>

//         <div className="mt-3 text-center">
//           <h6>Captured Images</h6>
//           <div className="d-flex flex-wrap justify-content-center">
//             {capturedImages.map((img, index) => (
//               <img
//                 key={index}
//                 src={img}
//                 alt={`Captured ${index + 1}`}
//                 className="border rounded m-1"
//                 style={{ width: "70px", height: "70px" }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterUser;
