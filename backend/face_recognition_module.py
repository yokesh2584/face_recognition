# import face_recognition
# import cv2
# import numpy as np
# import os
# import pickle
# import uuid

# class FaceRecognitionModule:
#     def __init__(self, db):
#         self.db = db  # Store db instance
#         self.known_face_encodings = []
#         self.known_face_ids = []
#         self.face_data_file = 'known_faces/face_data.pkl'
        
#         # Create directory if it doesn't exist
#         os.makedirs('known_faces', exist_ok=True)
        
#         # Load existing face data if available
#         self.load_face_data()
    
#     def load_face_data(self):
#         """Load face encodings from file"""
#         if os.path.exists(self.face_data_file):
#             with open(self.face_data_file, 'rb') as f:
#                 data = pickle.load(f)
#                 self.known_face_encodings = data['encodings']
#                 self.known_face_ids = data['ids']
#                 print(f"Loaded {len(self.known_face_ids)} face encodings")
    
#     def save_face_data(self):
#         """Save face encodings to file"""
#         with open(self.face_data_file, 'wb') as f:
#             data = {
#                 'encodings': self.known_face_encodings,
#                 'ids': self.known_face_ids
#             }
#             pickle.dump(data, f)
    


#     def add_face(self, user_id, image):
#         """Add a new face encoding"""
#         face_locations = face_recognition.face_locations(image)
        
#         if not face_locations:
#             raise ValueError("No face detected in the image")
        
#         # Use the first face found
#         face_encoding = face_recognition.face_encodings(image, [face_locations[0]])[0]
        
#         # Save face encoding and user ID
#         self.known_face_encodings.append(face_encoding)
#         self.known_face_ids.append(user_id)
        
#         # Save to file
#         self.save_face_data()
        
#         # Also save the face image for reference
#         face_img_path = f"known_faces/{user_id}.jpg"
#         top, right, bottom, left = face_locations[0]
#         face_image = image[top:bottom, left:right]
#         cv2.imwrite(face_img_path, face_image)
        
#         return True
    
#     def recognize_face(self, image):
#         """Recognize a face in the image and ensure the user exists in MongoDB"""
#         if not self.known_face_encodings:
#             return None

#         # Detect faces
#         face_locations = face_recognition.face_locations(image)
        
#         if not face_locations:
#             return None

#         # Get encodings for detected faces
#         face_encodings = face_recognition.face_encodings(image, face_locations)

#         for face_encoding in face_encodings:
#             # Compare with known faces
#             matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.4)

#             if True in matches:
#                 match_index = matches.index(True)
#                 recognized_user_id = self.known_face_ids[match_index]

#                 # Double-check in MongoDB before returning the user_id
#                 user = self.db.get_user(recognized_user_id)

#                 if user:
#                     print(f"✅ User Found in DB: {recognized_user_id}")
#                     return recognized_user_id
#                 else:
#                     print(f"⚠️ User ID {recognized_user_id} not found in DB! Removing from face_data.pkl...")
#                     # Remove the outdated user_id
#                     del self.known_face_encodings[match_index]
#                     del self.known_face_ids[match_index]
#                     self.save_face_data()

#         return None  # No valid user found



import face_recognition
import cv2
import numpy as np
import os
import pickle
import uuid

class FaceRecognitionModule:
    def __init__(self, db):
        self.db = db
        self.known_face_encodings = []
        self.known_face_ids = []
        self.encodings_file = "face_encodings.pkl"
        
        # Load existing face encodings if available
        self.load_encodings()
    
    def load_encodings(self):
        """Load face encodings from file if it exists"""
        if os.path.exists(self.encodings_file):
            try:
                with open(self.encodings_file, 'rb') as f:
                    data = pickle.load(f)
                    self.known_face_encodings = data.get('encodings', [])
                    self.known_face_ids = data.get('ids', [])
                print(f"Loaded {len(self.known_face_encodings)} face encodings")
            except Exception as e:
                print(f"Error loading face encodings: {e}")
                # Initialize empty if loading fails
                self.known_face_encodings = []
                self.known_face_ids = []
    
    def save_encodings(self):
        """Save face encodings to file"""
        data = {
            'encodings': self.known_face_encodings,
            'ids': self.known_face_ids
        }
        with open(self.encodings_file, 'wb') as f:
            pickle.dump(data, f)
    
    def add_face(self, user_id, image):
        """Add a face encoding for a user"""
        # Detect face locations
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            raise ValueError("No face detected in the image")
        
        # Use the first face found (assuming one face per image)
        face_encoding = face_recognition.face_encodings(image, [face_locations[0]])[0]
        
        # Add to known faces
        self.known_face_encodings.append(face_encoding)
        self.known_face_ids.append(user_id)
        
        # Save updated encodings
        self.save_encodings()
        
        return True
    
    def recognize_face(self, image, tolerance=0.4):
        """Recognize a face in the image and return user_id if found"""
        if not self.known_face_encodings:
            return None
        
        # Detect face locations
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            return None
        
        # Use the first face found
        face_encoding = face_recognition.face_encodings(image, [face_locations[0]])[0]
        
        # Compare with known faces
        matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=tolerance)
        
        # If no matches, return None
        if not any(matches):
            return None
        
        # Find the index of the first match
        match_index = matches.index(True)
        
        # Return the user_id of the matched face
        return self.known_face_ids[match_index]