Registration
Authentication option: Google, and Email link (Resend)
Step 2: Continue
Form to capture State, region (lga), phone number, how did your hear about us

PVC - Private Virtual Class
A sophisticated virtual learning platform designed for flexible, instructor-paired online education with intelligent interview management, curriculum tracking, and comprehensive feedback systems.
Overview
PVC enables organizations to offer structured virtual courses with intelligent tutor-student pairing, rigorous tutor vetting through interviews, and detailed progress tracking with built-in conflict resolution mechanisms.
Core Features
1. Authentication & User Management

User registration (Students, Tutors, Admins)
Role-based access control (RBAC)
Secure authentication system
User profile management with role-specific details

2. Tutor Interview System

Interview Scheduling: Aspiring tutors select interview dates within 30 days of registration
Smart Calendar: Creative, full-row calendar view with disabled slots when capacity is reached (e.g., 10 slots per day)
Interview Conduction: Virtual interviews via Google Meet
Admin Control: Admins manually create Google Meet links and send to tutor dashboards
Auto-Notifications: System sends email with Google Meet link to tutors
Onboarding Orientation: Tutors who pass interviews receive email + dashboard link to onboarding (typically Telegram group)
Post-Interview Workflow: Friday consolidation where all passed tutors receive onboarding materials

3. Course Management (Admin)

Create and manage courses with detailed metadata
Define course structure: title, description, photo, price, duration, frequency, session length
Create and maintain curriculum organized in modules and sessions
Set course awards/certifications
Define learning objectives and market opportunities
FAQ management per course

4. Student Enrollment & Tutor Pairing

Students can enroll in multiple courses
Intelligent Pairing Algorithm: System automatically pairs student with available instructor
Pairing Workflow: Tutor can accept or decline pairing
Auto-Reassignment: Declined pairings shift to next available tutor (Bolt-like system)
Auto-Notification: Student receives email when pairing is accepted

5. Learning Session Management

Track lessons taught per curriculum module
Tutor Action: Mark lesson as "TAUGHT" after session completion
Student Confirmation: Student confirms lesson was taught
Feedback Collection: Post-lesson survey from student
Course Completion: Major review upon course completion

6. Conflict Resolution

If student disputes that lesson was taught, status becomes unresolvable
Tutor cannot re-mark that specific lesson as taught
Prevents gaming of the system

7. Dashboard Features

Student Dashboard: Enrollments, pairings, sessions, feedback forms, onboarding links
Tutor Dashboard: Interview schedules, Google Meet links, paired students, lesson tracking
Admin Dashboard: Course management, curriculum editing, tutor approvals, analytics

Technical Architecture
Tech Stack

Backend: [Specify: Nextjs.]
Database: [Specify: Firebase.]
Frontend: [Specify: React, Js.]
Authentication: Nextauth
Email Service: [Specify: Nodemailer or Resend.]
Video Integration: Google Meet API-undecided

Database Schema (Key Entities)
Users

id, email, password_hash, role (student/tutor/admin), created_at, status

Tutors

user_id, bio, qualifications, interview_status, onboarding_status, availability

Students

user_id, enrollment_history, feedback_given

Courses

id, title, description, photo_url, price, duration_months, frequency_days_per_week, session_length_hours, format, award, admin_id, created_at

Curriculum

id, course_id, organized as modules and sessions (hierarchical structure)

InterviewSlots

id, created_at, capacity (e.g., 10), interview_date, filled_count, tutor_assignments

Enrollments

id, student_id, course_id, status (active/completed/dropped), enrollment_date

Pairings

id, enrollment_id, tutor_id, status (pending/accepted/declined), assigned_date, accepted_date

Sessions

id, pairing_id, curriculum_session_id, status (scheduled/taught/confirmed/disputed), tutor_marked_at, student_confirmed_at

Feedback

id, session_id, student_id, rating, comments, created_at

CourseReview

id, enrollment_id, student_id, rating, detailed_review, created_at

GoogleMeetLinks

id, tutor_id, interview_slot_id, meet_url, email_sent, created_at

OnboardingLinks

id, tutor_id, link, email_sent, created_at

Key APIs & Endpoints
Auth

POST /auth/register
POST /auth/login
GET /auth/profile
PUT /auth/profile

Tutor Interview

GET /interviews/available-slots (with 30-day range logic)
POST /interviews/book-slot
GET /interviews/my-scheduled
GET /interviews/status

Admin - Interviews

POST /admin/interviews/create-meet (creates Google Meet + stores link)
POST /admin/interviews/send-link (triggers email + dashboard update)
GET /admin/interviews/passed (returns tutors who passed for onboarding)
POST /admin/interviews/send-onboarding

Courses

POST /admin/courses/create
PUT /admin/courses/:id
GET /courses (with filters)
GET /courses/:id/curriculum

Curriculum

POST /admin/curriculum/:course_id/modules
POST /admin/curriculum/modules/:id/sessions
PUT /admin/curriculum/sessions/:id
DELETE /admin/curriculum/sessions/:id

Enrollment & Pairing

POST /enrollments (student enrolls in course)
GET /enrollments/my-enrollments
POST /pairings/:enrollment_id/accept (tutor accepts)
POST /pairings/:enrollment_id/decline (tutor declines, triggers reassignment)
GET /pairings/pending (admin view of pairing queue)

Sessions & Feedback

POST /sessions/:id/mark-taught (tutor marks lesson taught)
POST /sessions/:id/confirm-taught (student confirms)
POST /sessions/:id/dispute (student disputes lesson was taught)
POST /feedback/session/:session_id (student submits post-lesson survey)
POST /feedback/course/:enrollment_id (student submits course review)

Notifications

Email triggers on: interview booking, interview Google Meet link, pairing acceptance, onboarding, session status changes

Workflow Examples
Tutor Onboarding Flow

Tutor registers
System calculates 30-day window
Tutor books interview slot from creative calendar
Admin creates Google Meet + sends to tutor dashboard + email
Interview conducted
Admin marks as passed/failed
If passed: Friday consolidation email + onboarding link (dashboard + email)

Student Learning Flow

Student enrolls in course
System pairs with available tutor (auto-email on acceptance)
Tutor marks lesson taught → student confirms → student fills survey
After course completion: student submits major review
If dispute: session locked, no resolution possible

Pairing Reassignment Flow (Bolt-like)

Student enrollment created
System finds Tutor A → offers pairing
Tutor A declines
System automatically offers to Tutor B (next available for that course)
Process repeats until accepted