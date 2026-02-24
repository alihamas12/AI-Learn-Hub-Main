#!/usr/bin/env python3

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Load backend URL from frontend .env
BACKEND_URL = "https://coursehaven-4.preview.emergentagent.com/api"

class AdminPanelTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.admin_user_id = None
        self.test_user_id = None
        self.test_instructor_id = None
        self.test_course_id = None
        self.results = []

    async def setup_session(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()

    async def cleanup_session(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()

    def log_result(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data,
            "timestamp": datetime.now().isoformat()
        })

    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BACKEND_URL}{endpoint}"
        
        default_headers = {"Content-Type": "application/json"}
        if headers:
            default_headers.update(headers)
        
        try:
            async with self.session.request(
                method, 
                url, 
                json=data if data else None,
                params=params if params else None,
                headers=default_headers
            ) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                return response.status < 400, response_data, response.status
        except Exception as e:
            return False, str(e), 0

    async def test_1_setup_admin_user(self):
        """Test 1: Create admin user or update existing user to admin role"""
        print("\n=== Test 1: Admin User Setup ===")
        
        # First try to register a new admin user
        admin_data = {
            "name": "Sarah Johnson",
            "email": "sarah.admin@coursehaven.com",
            "password": "AdminPass123!",
            "role": "admin"
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", admin_data)
        
        if success and "token" in response:
            self.admin_token = response["token"]
            self.admin_user_id = response["user"]["id"]
            self.log_result("Admin User Registration", True, f"Created new admin user: {admin_data['email']}")
        else:
            # User might already exist, try to login
            login_data = {
                "email": admin_data["email"],
                "password": admin_data["password"]
            }
            
            success, response, status = await self.make_request("POST", "/auth/login", login_data)
            
            if success and "token" in response:
                self.admin_token = response["token"]
                self.admin_user_id = response["user"]["id"]
                
                # Check if user is admin, if not, we need to manually update (this would be done via database)
                if response["user"]["role"] != "admin":
                    self.log_result("Admin User Setup", False, f"User exists but is not admin role: {response['user']['role']}")
                    return False
                else:
                    self.log_result("Admin User Login", True, f"Logged in existing admin user: {admin_data['email']}")
            else:
                self.log_result("Admin User Setup", False, f"Failed to create or login admin user: {response}")
                return False
        
        return True

    async def test_2_create_test_data(self):
        """Test 2: Create test users, instructor, and course for testing"""
        print("\n=== Test 2: Create Test Data ===")
        
        # Create a regular user for testing user management
        user_data = {
            "name": "Michael Chen",
            "email": "michael.student@coursehaven.com",
            "password": "StudentPass123!",
            "role": "student"
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", user_data)
        if success and "user" in response:
            self.test_user_id = response["user"]["id"]
            self.log_result("Test User Creation", True, f"Created test user: {user_data['email']}")
        else:
            # Try to login if user exists
            login_data = {"email": user_data["email"], "password": user_data["password"]}
            success, response, status = await self.make_request("POST", "/auth/login", login_data)
            if success:
                self.test_user_id = response["user"]["id"]
                self.log_result("Test User Login", True, f"Using existing test user: {user_data['email']}")
            else:
                self.log_result("Test User Setup", False, f"Failed to create/login test user: {response}")
                return False
        
        # Create instructor user and apply for instructor role
        instructor_data = {
            "name": "Dr. Emily Rodriguez",
            "email": "emily.instructor@coursehaven.com",
            "password": "InstructorPass123!",
            "role": "instructor"
        }
        
        success, response, status = await self.make_request("POST", "/auth/register", instructor_data)
        instructor_token = None
        
        if success and "token" in response:
            instructor_token = response["token"]
            instructor_user_id = response["user"]["id"]
        else:
            # Try login
            login_data = {"email": instructor_data["email"], "password": instructor_data["password"]}
            success, response, status = await self.make_request("POST", "/auth/login", login_data)
            if success:
                instructor_token = response["token"]
                instructor_user_id = response["user"]["id"]
        
        if instructor_token:
            # Apply for instructor status
            headers = {"Authorization": f"Bearer {instructor_token}"}
            success, response, status = await self.make_request(
                "POST", "/instructors/apply", 
                params={"bio": "Experienced software engineer with 10+ years in web development"}, 
                headers=headers
            )
            
            if success and "instructor" in response:
                self.test_instructor_id = response["instructor"]["id"]
                self.log_result("Test Instructor Creation", True, f"Created test instructor: {instructor_data['email']}")
            elif "Already applied" in str(response):
                # Get existing instructor ID
                success, instructors, status = await self.make_request("GET", "/instructors", headers=headers)
                if success and instructors:
                    for instructor in instructors:
                        if instructor.get("user_id") == instructor_user_id:
                            self.test_instructor_id = instructor["id"]
                            self.log_result("Test Instructor Login", True, f"Using existing instructor: {instructor_data['email']}")
                            break
                if not self.test_instructor_id:
                    self.log_result("Test Instructor Creation", False, f"Could not find existing instructor: {response}")
            else:
                self.log_result("Test Instructor Creation", False, f"Failed to create instructor: {response}")
        
        # Approve the instructor first using admin token
        if self.admin_token and self.test_instructor_id:
            admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
            success, response, status = await self.make_request(
                "PATCH", f"/instructors/{self.test_instructor_id}/approve",
                params={"approved": "true"}, headers=admin_headers
            )
            if success:
                self.log_result("Instructor Pre-approval", True, "Approved instructor for course creation")
            else:
                self.log_result("Instructor Pre-approval", False, f"Failed to approve instructor: {response}")
        
        # Create a test course in draft status
        if instructor_token and self.test_instructor_id:
            headers = {"Authorization": f"Bearer {instructor_token}"}
            course_data = {
                "title": "Advanced Python Programming",
                "description": "Master advanced Python concepts including decorators, metaclasses, and async programming",
                "category": "Programming",
                "price": 199.99,
                "status": "draft"
            }
            
            success, response, status = await self.make_request("POST", "/courses", course_data, headers)
            if success and "id" in response:
                self.test_course_id = response["id"]
                self.log_result("Test Course Creation", True, f"Created test course: {course_data['title']}")
            else:
                self.log_result("Test Course Creation", False, f"Failed to create test course: {response}")
        
        return True

    async def test_3_admin_user_management(self):
        """Test 3: Admin User Management APIs"""
        print("\n=== Test 3: Admin User Management APIs ===")
        
        if not self.admin_token:
            self.log_result("Admin User Management", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /admin/users
        success, response, status = await self.make_request("GET", "/admin/users", headers=headers)
        if success and isinstance(response, list):
            self.log_result("GET /admin/users", True, f"Retrieved {len(response)} users")
        else:
            self.log_result("GET /admin/users", False, f"Failed to get users: {response}")
        
        if not self.test_user_id:
            self.log_result("User Management Tests", False, "No test user ID available")
            return False
        
        # Get a valid user ID from the users list
        success, users_list, status = await self.make_request("GET", "/admin/users", headers=headers)
        valid_user_id = None
        if success and users_list:
            # Find a user that's not the admin
            for user in users_list:
                if user.get("id") != self.admin_user_id and user.get("role") == "student":
                    valid_user_id = user["id"]
                    break
        
        # Test PATCH /admin/users/{user_id}/role - Update to instructor
        if valid_user_id:
            success, response, status = await self.make_request(
                "PATCH", f"/admin/users/{valid_user_id}/role",
                params={"new_role": "instructor"}, headers=headers
            )
            if success:
                self.log_result("PATCH /admin/users/{id}/role", True, f"Updated user role to instructor: {response}")
            else:
                self.log_result("PATCH /admin/users/{id}/role", False, f"Failed to update role: {response}")
        else:
            self.log_result("PATCH /admin/users/{id}/role", False, "No valid student user found to update")
        
        # Test PATCH /admin/users/{user_id}/status - Deactivate user
        if valid_user_id:
            success, response, status = await self.make_request(
                "PATCH", f"/admin/users/{valid_user_id}/status",
                params={"active": "false"}, headers=headers
            )
            if success:
                self.log_result("PATCH /admin/users/{id}/status (deactivate)", True, f"Deactivated user: {response}")
            else:
                self.log_result("PATCH /admin/users/{id}/status (deactivate)", False, f"Failed to deactivate: {response}")
            
            # Test PATCH /admin/users/{user_id}/status - Reactivate user
            success, response, status = await self.make_request(
                "PATCH", f"/admin/users/{valid_user_id}/status",
                params={"active": "true"}, headers=headers
            )
            if success:
                self.log_result("PATCH /admin/users/{id}/status (activate)", True, f"Reactivated user: {response}")
            else:
                self.log_result("PATCH /admin/users/{id}/status (activate)", False, f"Failed to reactivate: {response}")
        else:
            self.log_result("PATCH /admin/users/{id}/status", False, "No valid user found for status testing")
        
        # Test DELETE /admin/users/{user_id} - Try to delete self (should fail)
        success, response, status = await self.make_request(
            "DELETE", f"/admin/users/{self.admin_user_id}", headers=headers
        )
        if not success and "Cannot delete yourself" in str(response):
            self.log_result("DELETE /admin/users/{id} (self-delete protection)", True, "Correctly prevented self-deletion")
        else:
            self.log_result("DELETE /admin/users/{id} (self-delete protection)", False, f"Self-deletion not prevented: {response}")
        
        return True

    async def test_4_admin_course_moderation(self):
        """Test 4: Admin Course Moderation APIs"""
        print("\n=== Test 4: Admin Course Moderation APIs ===")
        
        if not self.admin_token:
            self.log_result("Course Moderation", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /admin/courses/pending
        success, response, status = await self.make_request("GET", "/admin/courses/pending", headers=headers)
        if success and isinstance(response, list):
            self.log_result("GET /admin/courses/pending", True, f"Retrieved {len(response)} pending courses")
            
            # Check if our test course is in the list
            if self.test_course_id:
                test_course_found = any(course.get("id") == self.test_course_id for course in response)
                if test_course_found:
                    self.log_result("Test Course in Pending List", True, "Test course found in pending courses")
                else:
                    self.log_result("Test Course in Pending List", False, "Test course not found in pending courses")
        else:
            self.log_result("GET /admin/courses/pending", False, f"Failed to get pending courses: {response}")
        
        if not self.test_course_id:
            self.log_result("Course Moderation Tests", False, "No test course ID available")
            return False
        
        # Test PATCH /admin/courses/{course_id}/moderate - Approve course
        success, response, status = await self.make_request(
            "PATCH", f"/admin/courses/{self.test_course_id}/moderate",
            params={"approved": "true"}, headers=headers
        )
        if success:
            self.log_result("PATCH /admin/courses/{id}/moderate (approve)", True, f"Approved course: {response}")
        else:
            self.log_result("PATCH /admin/courses/{id}/moderate (approve)", False, f"Failed to approve course: {response}")
        
        # Test PATCH /admin/courses/{course_id}/feature - Feature course
        success, response, status = await self.make_request(
            "PATCH", f"/admin/courses/{self.test_course_id}/feature",
            params={"featured": "true"}, headers=headers
        )
        if success:
            self.log_result("PATCH /admin/courses/{id}/feature (enable)", True, f"Featured course: {response}")
        else:
            self.log_result("PATCH /admin/courses/{id}/feature (enable)", False, f"Failed to feature course: {response}")
        
        # Test PATCH /admin/courses/{course_id}/feature - Unfeature course
        success, response, status = await self.make_request(
            "PATCH", f"/admin/courses/{self.test_course_id}/feature",
            params={"featured": "false"}, headers=headers
        )
        if success:
            self.log_result("PATCH /admin/courses/{id}/feature (disable)", True, f"Unfeatured course: {response}")
        else:
            self.log_result("PATCH /admin/courses/{id}/feature (disable)", False, f"Failed to unfeature course: {response}")
        
        return True

    async def test_5_instructor_approval(self):
        """Test 5: Instructor Approval APIs"""
        print("\n=== Test 5: Instructor Approval APIs ===")
        
        if not self.admin_token:
            self.log_result("Instructor Approval", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /instructors (with admin auth)
        success, response, status = await self.make_request("GET", "/instructors", headers=headers)
        if success and isinstance(response, list):
            self.log_result("GET /instructors (with admin auth)", True, f"Retrieved {len(response)} instructors")
        else:
            self.log_result("GET /instructors (with admin auth)", False, f"Failed to get instructors: {response}")
        
        if not self.test_instructor_id:
            self.log_result("Instructor Approval Tests", False, "No test instructor ID available")
            return False
        
        # Get current instructors to find a valid ID for testing
        success, instructors, status = await self.make_request("GET", "/instructors", headers=headers)
        rejected_instructor_id = None
        approved_instructor_id = None
        
        if success and instructors:
            # Find instructors with different statuses
            for instructor in instructors:
                if instructor.get("verification_status") == "rejected":
                    rejected_instructor_id = instructor["id"]
                elif instructor.get("verification_status") == "approved":
                    approved_instructor_id = instructor["id"]
        
        # Test approving a rejected instructor (should work)
        if rejected_instructor_id:
            success, response, status = await self.make_request(
                "PATCH", f"/instructors/{rejected_instructor_id}/approve",
                params={"approved": "true"}, headers=headers
            )
            if success:
                self.log_result("PATCH /instructors/{id}/approve (approve rejected)", True, f"Approved rejected instructor: {response}")
            else:
                self.log_result("PATCH /instructors/{id}/approve (approve rejected)", False, f"Failed to approve rejected instructor: {response}")
        
        # Test rejecting an approved instructor (should work)
        if approved_instructor_id:
            success, response, status = await self.make_request(
                "PATCH", f"/instructors/{approved_instructor_id}/approve",
                params={"approved": "false"}, headers=headers
            )
            if success:
                self.log_result("PATCH /instructors/{id}/approve (reject approved)", True, f"Rejected approved instructor: {response}")
            else:
                self.log_result("PATCH /instructors/{id}/approve (reject approved)", False, f"Failed to reject approved instructor: {response}")
        
        if not rejected_instructor_id and not approved_instructor_id:
            self.log_result("Instructor Approval Tests", False, "No valid instructors found for approval testing")
        
        return True

    async def test_6_admin_analytics(self):
        """Test 6: Admin Analytics API"""
        print("\n=== Test 6: Admin Analytics API ===")
        
        if not self.admin_token:
            self.log_result("Admin Analytics", False, "No admin token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Test GET /admin/analytics
        success, response, status = await self.make_request("GET", "/admin/analytics", headers=headers)
        if success and isinstance(response, dict):
            required_fields = ["total_users", "total_courses", "total_enrollments", "total_revenue", "admin_earnings"]
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                self.log_result("GET /admin/analytics", True, f"Analytics data complete: {response}")
            else:
                self.log_result("GET /admin/analytics", False, f"Missing fields: {missing_fields}")
        else:
            self.log_result("GET /admin/analytics", False, f"Failed to get analytics: {response}")
        
        return True

    async def test_7_authorization_checks(self):
        """Test 7: Authorization checks - non-admin users should get 403"""
        print("\n=== Test 7: Authorization Checks ===")
        
        # Create a regular user token for testing
        user_data = {
            "email": "michael.student@coursehaven.com",
            "password": "StudentPass123!"
        }
        
        success, response, status = await self.make_request("POST", "/auth/login", user_data)
        if not success:
            self.log_result("Authorization Tests", False, "Could not get regular user token")
            return False
        
        user_token = response["token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        # Test that regular user gets 403 for admin endpoints
        test_endpoints = [
            ("GET", "/admin/users"),
            ("GET", "/admin/analytics"),
            ("GET", "/admin/courses/pending"),
        ]
        
        for method, endpoint in test_endpoints:
            success, response, status = await self.make_request(method, endpoint, headers=user_headers)
            if status == 403:
                self.log_result(f"Authorization Check: {method} {endpoint}", True, "Correctly returned 403 Forbidden")
            else:
                self.log_result(f"Authorization Check: {method} {endpoint}", False, f"Expected 403, got {status}: {response}")
        
        return True

    async def run_all_tests(self):
        """Run all admin panel tests"""
        print("🚀 Starting Admin Panel Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Run tests in sequence
            await self.test_1_setup_admin_user()
            await self.test_2_create_test_data()
            await self.test_3_admin_user_management()
            await self.test_4_admin_course_moderation()
            await self.test_5_instructor_approval()
            await self.test_6_admin_analytics()
            await self.test_7_authorization_checks()
            
        finally:
            await self.cleanup_session()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.results if result["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        # Print failed tests
        failed_tests = [result for result in self.results if not result["success"]]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  • {test['test']}: {test['details']}")
        
        return passed == total

async def main():
    """Main test runner"""
    tester = AdminPanelTester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    import sys
    result = asyncio.run(main())
    sys.exit(result)