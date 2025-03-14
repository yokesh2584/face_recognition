from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

class Database:
    def __init__(self):
        # Get MongoDB connection string from environment variable or use default
        mongo_uri = os.getenv('MONGO_URI')
        self.client = MongoClient(mongo_uri)
        self.db = self.client['face_recognition_attendance_system']
        self.users_collection = self.db['users']
        self.attendance_collection = self.db['attendance']
    
    def add_user(self, name, email, role):
        """Add a new user to the database"""
        user_id = str(uuid.uuid4())
        user = {
            'user_id': user_id,
            'name': name,
            'email': email,
            'role': role,
            'created_at': datetime.now()
        }
        self.users_collection.insert_one(user)
        return user_id
    
    # def get_user(self, user_id):
    #     """Get user by ID"""
    #     user = self.users_collection.find_one({'user_id': user_id}, {'_id': 0})
    #     return user
    
    def get_user(self, user_id):
        """Get user by ID"""
        print(f"Looking for user_id: {user_id}")  # Debugging print
        user = self.users_collection.find_one({'user_id': user_id}, {'_id': 0})
        print(f"MongoDB Query Result: {user}")  # Debugging print
        return user

    
    def get_all_users(self):
        """Get all users"""
        users = list(self.users_collection.find({}, {'_id': 0}))
        return users
    
    def mark_attendance(self, user_id):
        """Mark attendance for a user"""
        now = datetime.now()
        date = now.strftime('%Y-%m-%d')
        time = now.strftime('%H:%M:%S')
        
        # Check if attendance already marked today
        existing = self.attendance_collection.find_one({
            'user_id': user_id,
            'date': date
        })
        
        if existing:
            # Update checkout time if already checked in
            self.attendance_collection.update_one(
                {'_id': existing['_id']},
                {'$set': {'checkout_time': time}}
            )
            return str(existing['_id'])
        else:
            # Create new attendance record
            attendance_id = str(uuid.uuid4())
            attendance = {
                'attendance_id': attendance_id,
                'user_id': user_id,
                'date': date,
                'checkin_time': time,
                'checkout_time': None,
                'created_at': now
            }
            self.attendance_collection.insert_one(attendance)
            return attendance_id
    
    def get_attendance_by_date(self, date):
        """Get attendance records for a specific date"""
        pipeline = [
            {'$match': {'date': date}},
            {'$lookup': {
                'from': 'users',
                'localField': 'user_id',
                'foreignField': 'user_id',
                'as': 'user'
            }},
            {'$unwind': '$user'},
            {'$project': {
                '_id': 0,
                'attendance_id': 1,
                'date': 1,
                'checkin_time': 1,
                'checkout_time': 1,
                'user_name': '$user.name',
                'user_email': '$user.email',
                'user_role': '$user.role'
            }}
        ]
        
        attendance = list(self.attendance_collection.aggregate(pipeline))
        return attendance