from flask import Flask, request, jsonify
# from flask_cors import CORS
from flask_cors import CORS, cross_origin
import os
from database import Database
from face_recognition_module import FaceRecognitionModule
import base64
import cv2
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize database
db = Database()

# Initialize face recognition module
face_module = FaceRecognitionModule(db)

@app.route('/api/register', methods=['POST'])
@cross_origin()
def register_user():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    image_data = data.get('image')
    
    if not all([name, email, role, image_data]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if the user already exists in the database
    existing_user = db.get_user_by_email(email)  # Assume this function checks for existing users
    if existing_user:
        return jsonify({"error": "User already exists"}), 409 
    
    # Convert base64 image to OpenCV format
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Save face encoding
    user_id = db.add_user(name, email, role)
    face_module.add_face(user_id, img)
    
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201


# @app.route('/api/register', methods=['POST'])
# @cross_origin()
# def register_user():
#     data = request.json
#     name = data.get('name')
#     email = data.get('email')
#     role = data.get('role')
#     images_data = data.get('images')  # Expecting multiple images

#     if not all([name, email, role, images_data]) or len(images_data) < 5:
#         return jsonify({"error": "Provide at least 5 images for registration"}), 400

#     user_id = db.add_user(name, email, role)

#     for image_data in images_data:
#         # Convert base64 to OpenCV format
#         encoded_data = image_data.split(',')[1]
#         nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
#         img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         # Add each image to face recognition module
#         face_module.add_face(user_id, img)

#     return jsonify({"message": "User registered successfully", "user_id": user_id}), 201


@app.route('/api/recognize', methods=['POST'])
@cross_origin()
def recognize_face():
    data = request.json
    image_data = data.get('image')
    
    if not image_data:
        return jsonify({"error": "No image provided"}), 400
    
    # Convert base64 image to OpenCV format
    encoded_data = image_data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Recognize face
    user_id = face_module.recognize_face(img)
    print(f"Recognized User ID: {user_id}")
    
    if user_id:
        # Mark attendance
        user = db.get_user(user_id)
        print(f"Fetched User: {user}")

        attendance_id = db.mark_attendance(user_id)
        return jsonify({
            "recognized": True,
            "user": user,
            "attendance_id": attendance_id,
            "timestamp": datetime.now().isoformat()
        }), 200
    else:
        return jsonify({"recognized": False}), 404


# @app.route('/api/recognize', methods=['POST'])
# @cross_origin()
# def recognize_face():
#     data = request.json
#     images_data = data.get('images')  # Expect multiple images

#     if not images_data or len(images_data) < 5:
#         return jsonify({"error": "Provide at least 5 images for recognition"}), 400

#     user_id_counts = {}

#     for image_data in images_data:
#         encoded_data = image_data.split(',')[1]
#         nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
#         img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         recognized_user_id = face_module.recognize_face(img)

#         if recognized_user_id:
#             user_id_counts[recognized_user_id] = user_id_counts.get(recognized_user_id, 0) + 1

#     # Find the user with the highest match count
#     if user_id_counts:
#         best_match = max(user_id_counts, key=user_id_counts.get)
#         user = db.get_user(best_match)
#         attendance_id = db.mark_attendance(best_match)

#         return jsonify({
#             "recognized": True,
#             "user": user,
#             "attendance_id": attendance_id,
#             "timestamp": datetime.now().isoformat()
#         }), 200

#     return jsonify({"recognized": False}), 404


@app.route('/api/users', methods=['GET'])
@cross_origin()
def get_users():
    users = db.get_all_users()
    return jsonify({"users": users}), 200

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    attendance = db.get_attendance_by_date(date)
    return jsonify({"attendance": attendance}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)