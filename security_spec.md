# Security Specification & Threat Model

## 1. Core Data Invariants
1. **Teacher Access Principle**: Teachers (identified by authenticated teacher record or matching admin/teacher email) have write permissions across curriculum, assignments, questions, task reviews, and student management.
2. **Student Submission Ownership**: Students can only create and update their own submissions (`student_id` or `user_id` must match `request.auth.uid` or verified student account).
3. **No Blanket Reads for Private Records**: Submissions, reflections, and specific student progress records are bound to the student owner or instructors.
4. **Validation Constraints**: All incoming payloads must be strictly bounded in length and type to prevent injection or denial-of-wallet attacks.
5. **Evaluation Integrity**: Students cannot self-score or modify `teacher_score`, `ai_score`, `score`, or review feedback.

## 2. The Dirty Dozen Malicious Payloads (Tested for PERMISSION_DENIED)
1. **Dirty Payload 1 (Identity Spoofing)**: A student attempts to create a submission under another student's `student_id` (`std_other_99`).
2. **Dirty Payload 2 (Self-Assigned Teacher Role)**: A student tries to register or update their user role from `student` to `teacher`.
3. **Dirty Payload 3 (Score Tampering)**: A student updates their task submission with `score: 100` and `status: "sudah_dinilai"`.
4. **Dirty Payload 4 (Shadow Fields Injection)**: A student attempts to insert ghost administrative fields like `isAdmin: true` into their profile.
5. **Dirty Payload 5 (Denial-of-Wallet Payload)**: An attacker attempts to write a 1MB junk string into `task_id` or `deskripsi`.
6. **Dirty Payload 6 (Oral Evaluation Hijacking)**: A student modifies the `ai_score` or `teacher_score` inside `/oral_submissions/{oralId}`.
7. **Dirty Payload 7 (Curriculum Sabotage)**: An unauthenticated user or student attempts to delete or overwrite `/curriculum_meetings`.
8. **Dirty Payload 8 (Question Bank Injection)**: A student attempts to alter the `correct_answer` field in `/questions/{questionId}`.
9. **Dirty Payload 9 (Blind List Query Scraping)**: An unauthorized caller attempts a blanket list query across private student evaluations without filtering by their own UID.
10. **Dirty Payload 10 (Password Brute Bypass)**: An unauthorized caller attempts to update a student's password field directly without proper student ownership.
11. **Dirty Payload 11 (Orphaned Progress Creation)**: An attacker creates a progress record referencing a non-existent student.
12. **Dirty Payload 12 (Audit Log Erasure)**: A user attempts to delete or alter past immutable audit trail logs.
