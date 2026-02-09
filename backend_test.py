#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from uuid import uuid4

class MedBuddyAPITester:
    def __init__(self, base_url="https://medbuddy-20.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"testuser{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "age": 65,
            "phone": "+1234567890"
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            return success, response.json() if success else f"Status: {response.status_code}, Response: {response.text}"

        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_user_registration(self):
        """Test user registration"""
        success, result = self.make_request('POST', '/auth/register', self.test_user, 200)
        if success:
            self.token = result.get('token')
            self.user_email = result.get('email')
            self.log_test("User Registration", True)
            return True
        else:
            self.log_test("User Registration", False, result)
            return False

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        success, result = self.make_request('POST', '/auth/login', login_data, 200)
        if success:
            self.token = result.get('token')
            self.log_test("User Login", True)
            return True
        else:
            self.log_test("User Login", False, result)
            return False

    def test_get_profile(self):
        """Test get user profile"""
        success, result = self.make_request('GET', '/profile', expected_status=200)
        if success and result.get('email') == self.user_email:
            self.log_test("Get Profile", True)
            return True
        else:
            self.log_test("Get Profile", False, result)
            return False

    def test_update_profile(self):
        """Test update user profile"""
        update_data = {
            "name": self.test_user["name"],
            "email": self.user_email,
            "age": 70,
            "phone": "+9876543210",
            "diseases": ["Diabetes", "Hypertension"]
        }
        success, result = self.make_request('PUT', '/profile', update_data, 200)
        self.log_test("Update Profile", success, result if not success else "")
        return success

    def test_create_medication(self):
        """Test create medication"""
        med_data = {
            "name": "Test Medicine",
            "dosage": "500mg",
            "frequency": "Twice daily",
            "times": ["08:00", "20:00"],
            "instructions": "Take with food"
        }
        success, result = self.make_request('POST', '/medications', med_data, 200)
        if success:
            self.medication_id = result.get('id')
            self.log_test("Create Medication", True)
            return True
        else:
            self.log_test("Create Medication", False, result)
            return False

    def test_get_medications(self):
        """Test get medications"""
        success, result = self.make_request('GET', '/medications', expected_status=200)
        if success and isinstance(result, list):
            self.log_test("Get Medications", True)
            return True
        else:
            self.log_test("Get Medications", False, result)
            return False

    def test_update_medication(self):
        """Test update medication"""
        if not hasattr(self, 'medication_id'):
            self.log_test("Update Medication", False, "No medication ID available")
            return False
            
        update_data = {
            "name": "Updated Test Medicine",
            "dosage": "250mg",
            "frequency": "Once daily",
            "times": ["09:00"],
            "instructions": "Take on empty stomach"
        }
        success, result = self.make_request('PUT', f'/medications/{self.medication_id}', update_data, 200)
        self.log_test("Update Medication", success, result if not success else "")
        return success

    def test_track_medication(self):
        """Test track medication"""
        if not hasattr(self, 'medication_id'):
            self.log_test("Track Medication", False, "No medication ID available")
            return False
            
        track_data = {
            "medication_id": self.medication_id,
            "taken": True,
            "taken_at": datetime.now().isoformat(),
            "missed": False
        }
        success, result = self.make_request('POST', '/tracker/medication', track_data, 200)
        self.log_test("Track Medication", success, result if not success else "")
        return success

    def test_get_today_tracker(self):
        """Test get today's tracker"""
        success, result = self.make_request('GET', '/tracker/today', expected_status=200)
        if success and 'medications' in result and 'water' in result and 'lunch' in result:
            self.log_test("Get Today Tracker", True)
            return True
        else:
            self.log_test("Get Today Tracker", False, result)
            return False

    def test_track_water(self):
        """Test track water intake"""
        success, result = self.make_request('POST', '/tracker/water', 5, 200)
        self.log_test("Track Water", success, result if not success else "")
        return success

    def test_track_lunch(self):
        """Test track lunch"""
        success, result = self.make_request('POST', '/tracker/lunch', True, 200)
        self.log_test("Track Lunch", success, result if not success else "")
        return success

    def test_send_message(self):
        """Test send message to doctor"""
        message_data = {
            "doctor_name": "Dr. Smith",
            "message": "I have a question about my medication schedule."
        }
        success, result = self.make_request('POST', '/messages', message_data, 200)
        if success:
            self.message_id = result.get('id')
            self.log_test("Send Message", True)
            return True
        else:
            self.log_test("Send Message", False, result)
            return False

    def test_get_messages(self):
        """Test get messages"""
        success, result = self.make_request('GET', '/messages', expected_status=200)
        if success and isinstance(result, list):
            self.log_test("Get Messages", True)
            return True
        else:
            self.log_test("Get Messages", False, result)
            return False

    def test_create_appointment(self):
        """Test create appointment"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        appt_data = {
            "doctor_name": "Dr. Johnson",
            "date": tomorrow,
            "time": "14:00",
            "reason": "Regular checkup",
            "type": "consultation"
        }
        success, result = self.make_request('POST', '/appointments', appt_data, 200)
        if success:
            self.appointment_id = result.get('id')
            self.log_test("Create Appointment", True)
            return True
        else:
            self.log_test("Create Appointment", False, result)
            return False

    def test_get_appointments(self):
        """Test get appointments"""
        success, result = self.make_request('GET', '/appointments', expected_status=200)
        if success and isinstance(result, list):
            self.log_test("Get Appointments", True)
            return True
        else:
            self.log_test("Get Appointments", False, result)
            return False

    def test_get_reminders(self):
        """Test get reminders"""
        success, result = self.make_request('GET', '/reminders', expected_status=200)
        if success and 'medications' in result and 'appointments' in result:
            self.log_test("Get Reminders", True)
            return True
        else:
            self.log_test("Get Reminders", False, result)
            return False

    def test_delete_medication(self):
        """Test delete medication"""
        if not hasattr(self, 'medication_id'):
            self.log_test("Delete Medication", False, "No medication ID available")
            return False
            
        success, result = self.make_request('DELETE', f'/medications/{self.medication_id}', expected_status=200)
        self.log_test("Delete Medication", success, result if not success else "")
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting MedBuddy API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 50)

        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False

        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False

        # Profile tests
        self.test_get_profile()
        self.test_update_profile()

        # Medication tests
        if self.test_create_medication():
            self.test_get_medications()
            self.test_update_medication()
            self.test_track_medication()
            self.test_delete_medication()

        # Tracker tests
        self.test_get_today_tracker()
        self.test_track_water()
        self.test_track_lunch()

        # Communication tests
        self.test_send_message()
        self.test_get_messages()
        self.test_create_appointment()
        self.test_get_appointments()
        self.test_get_reminders()

        # Print summary
        print("=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MedBuddyAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())