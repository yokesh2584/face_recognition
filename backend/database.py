# from pymongo import MongoClient
# from datetime import datetime
# import os
# from dotenv import load_dotenv
# import uuid

# load_dotenv()

# class Database:
#     def __init__(self):
#         # Get MongoDB connection string from environment variable or use default
#         mongo_uri = os.getenv('MONGO_URI')
#         self.client = MongoClient(mongo_uri)
#         self.db = self.client['face_recognition_attendance_system']
#         self.users_collection = self.db['users']
#         self.attendance_collection = self.db['attendance']
    
#     def add_user(self, name, email, role):
#         """Add a new user to the database"""
#         user_id = str(uuid.uuid4())
#         user = {
#             'user_id': user_id,
#             'name': name,
#             'email': email,
#             'role': role,
#             'created_at': datetime.now()
#         }
#         self.users_collection.insert_one(user)
#         return user_id
    
#     # def get_user(self, user_id):
#     #     """Get user by ID"""
#     #     user = self.users_collection.find_one({'user_id': user_id}, {'_id': 0})
#     #     return user
    
#     def get_user(self, user_id):
#         """Get user by ID"""
#         print(f"Looking for user_id: {user_id}")  # Debugging print
#         user = self.users_collection.find_one({'user_id': user_id}, {'_id': 0})
#         print(f"MongoDB Query Result: {user}")  # Debugging print
#         return user
    
#     def get_user_by_email(self, email):
#         user = self.users_collection.find_one({"email": email})
#         return user

    
#     def get_all_users(self):
#         """Get all users"""
#         users = list(self.users_collection.find({}, {'_id': 0}))
#         return users
    
#     def mark_attendance(self, user_id):
#         """Mark attendance for a user"""
#         now = datetime.now()
#         date = now.strftime('%Y-%m-%d')
#         time = now.strftime('%H:%M:%S')
        
#         # Check if attendance already marked today
#         existing = self.attendance_collection.find_one({
#             'user_id': user_id,
#             'date': date
#         })
        
#         if existing:
#             # Update checkout time if already checked in
#             self.attendance_collection.update_one(
#                 {'_id': existing['_id']},
#                 {'$set': {'checkout_time': time}}
#             )
#             return str(existing['_id'])
#         else:
#             # Create new attendance record
#             attendance_id = str(uuid.uuid4())
#             attendance = {
#                 'attendance_id': attendance_id,
#                 'user_id': user_id,
#                 'date': date,
#                 'checkin_time': time,
#                 'checkout_time': None,
#                 'created_at': now
#             }
#             self.attendance_collection.insert_one(attendance)
#             return attendance_id
    
#     def get_attendance_by_date(self, date):
#         """Get attendance records for a specific date"""
#         pipeline = [
#             {'$match': {'date': date}},
#             {'$lookup': {
#                 'from': 'users',
#                 'localField': 'user_id',
#                 'foreignField': 'user_id',
#                 'as': 'user'
#             }},
#             {'$unwind': '$user'},
#             {'$project': {
#                 '_id': 0,
#                 'attendance_id': 1,
#                 'date': 1,
#                 'checkin_time': 1,
#                 'checkout_time': 1,
#                 'user_name': '$user.name',
#                 'user_email': '$user.email',
#                 'user_role': '$user.role'
#             }}
#         ]
        
#         attendance = list(self.attendance_collection.aggregate(pipeline))
#         return attendance




from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid
import calendar

load_dotenv()

class Database:
    def __init__(self):
        # Get MongoDB connection string from environment variable or use default
        mongo_uri = os.getenv('MONGO_URI')
        self.client = MongoClient(mongo_uri)
        self.db = self.client['student_attendance_system']
        self.users_collection = self.db['users']
        self.attendance_collection = self.db['attendance']
        self.departments_collection = self.db['departments']
    
    def add_user(self, name, email, department):
        """Add a new student to the database"""
        user_id = str(uuid.uuid4())
        user = {
            'user_id': user_id,
            'name': name,
            'email': email,
            'department': department,
            'created_at': datetime.now()
        }
        self.users_collection.insert_one(user)
        
        # Ensure department exists in departments collection
        self.departments_collection.update_one(
            {'name': department},
            {'$set': {'name': department}},
            upsert=True
        )
        
        return user_id
    
    def get_user(self, user_id):
        """Get user by ID"""
        user = self.users_collection.find_one({'user_id': user_id}, {'_id': 0})
        return user
    
    def get_user_by_email(self, email):
        user = self.users_collection.find_one({"email": email})
        return user
    
    def get_all_users(self):
        """Get all users"""
        users = list(self.users_collection.find({}, {'_id': 0}))
        return users
    
    def get_departments(self):
        """Get all departments"""
        departments = list(self.departments_collection.find({}, {'_id': 0}))
        return [dept['name'] for dept in departments]
    
    def mark_attendance(self, user_id, period, subject):
        """Mark attendance for a student for a specific period and subject"""
        now = datetime.now()
        date = now.strftime('%Y-%m-%d')
        time = now.strftime('%H:%M:%S')
        
        # Check if attendance already marked for this period today
        existing = self.attendance_collection.find_one({
            'user_id': user_id,
            'date': date,
            'period': period
        })
        
        if existing:
            # Update existing record
            self.attendance_collection.update_one(
                {'_id': existing['_id']},
                {'$set': {'time': time, 'subject': subject}}
            )
            return str(existing['_id'])
        else:
            # Create new attendance record
            attendance_id = str(uuid.uuid4())
            attendance = {
                'attendance_id': attendance_id,
                'user_id': user_id,
                'date': date,
                'period': period,
                'subject': subject,
                'time': time,
                'created_at': now
            }
            self.attendance_collection.insert_one(attendance)
            return attendance_id
    
    def get_attendance_by_date(self, date, period=None):
        """Get attendance records for a specific date and optional period"""
        match_query = {'date': date}
        if period:
            match_query['period'] = int(period)
            
        pipeline = [
            {'$match': match_query},
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
                'period': 1,
                'subject': 1,
                'time': 1,
                'user_id': 1,
                'user_name': '$user.name',
                'user_email': '$user.email',
                'department': '$user.department'
            }}
        ]
        
        attendance = list(self.attendance_collection.aggregate(pipeline))
        return attendance
    
    def get_monthly_attendance(self, month, department=None):
        """Get monthly attendance report with percentage calculation"""
        year, month = map(int, month.split('-'))
        
        # Get the number of days in the month
        _, last_day = calendar.monthrange(year, month)
        
        # Format date strings for the month
        start_date = f"{year}-{month:02d}-01"
        end_date = f"{year}-{month:02d}-{last_day}"
        
        # Total number of school days in the month (excluding weekends)
        total_school_days = sum(1 for day in range(1, last_day + 1) 
                               if calendar.weekday(year, month, day) < 5)  # 0-4 are weekdays
        
        # Total possible classes per student (5 periods per day)
        total_possible_classes = total_school_days * 5
        
        # Query to match users from specific department if provided
        user_match = {}
        if department and department != "all":
            user_match = {'department': department}
        
        # Get all users
        users = list(self.users_collection.find(user_match, {'_id': 0}))
        
        # Get attendance for the month
        pipeline = [
            {'$match': {
                'date': {'$gte': start_date, '$lte': end_date}
            }},
            {'$group': {
                '_id': '$user_id',
                'classes_attended': {'$sum': 1}
            }}
        ]
        
        attendance_counts = {
            record['_id']: record['classes_attended'] 
            for record in self.attendance_collection.aggregate(pipeline)
        }
        
        # Prepare the report
        report = []
        for user in users:
            user_id = user['user_id']
            classes_attended = attendance_counts.get(user_id, 0)
            attendance_percentage = round((classes_attended / total_possible_classes) * 100, 2) if total_possible_classes > 0 else 0
            
            report.append({
                'user_id': user_id,
                'user_name': user['name'],
                'department': user['department'],
                'total_classes': total_possible_classes,
                'classes_attended': classes_attended,
                'attendance_percentage': attendance_percentage
            })
        
        return report