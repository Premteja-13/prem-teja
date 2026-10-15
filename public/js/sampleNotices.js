/**
 * NoticeSense AI — Benchmark & Evaluation Sample Notices
 * 
 * 5 Varied campus notices covering all edge cases specified in prompt:
 * 1. Clear deadline
 * 2. No deadline
 * 3. Multiple dates (submission deadline vs event date)
 * 4. Fees and eligibility requirements
 * 5. Ambiguous or contradictory information
 */

const SAMPLE_NOTICES = [
  {
    id: 'sample-1',
    title: 'Merit-Cum-Means National Scholarship 2026-27',
    category: 'Financial Aid & Scholarships',
    description: 'Notice with clear hard deadline and specific document list',
    text: `OFFICE OF THE DEAN OF STUDENT WELFARE
APEX INSTITUTE OF TECHNOLOGY & SCIENCE
Circular Ref No: AITS/DSW/SCH/2026/089
Date: 12th October 2026

NOTICE: MERIT-CUM-MEANS SCHOLARSHIP 2026-27

Applications are invited from full-time undergraduate B.Tech students for the award of Merit-cum-Means (MCM) Scholarship for the Academic Year 2026-27.

ELIGIBILITY CRITERIA:
1. The student must have secured a minimum Cumulative Grade Point Average (CGPA) of 7.50 without any active backlogs.
2. The gross annual family income from all sources must not exceed ₹4,50,000/- (Rupees Four Lakh Fifty Thousand only) per annum.
3. This scholarship is available only to students admitted in 2nd, 3rd, and 4th years of study. 1st year students are not eligible under this circular.

MANDATORY DOCUMENTS REQUIRED:
- Duly filled and signed application form (Form MCM-A).
- Verified copy of Grade Sheet of previous academic year.
- Valid Income Certificate issued by an officer not below the rank of Tahsildar / Revenue Officer (issued after 1st April 2026).
- Copy of student Aadhaar card and active bank passbook showing IFSC code.

SUBMISSION DEADLINE:
The completed application form along with self-attested photocopies of all required documents must be submitted to the Student Welfare Section (Administrative Block, Room No. 204) on or before 25th October 2026 before 5:00 PM.

IMPORTANT NOTES:
- Incomplete applications or submissions after 25th October 2026 5:00 PM will be rejected summarily without further notice.
- There is NO application fee for this scholarship.

For any queries, contact Dr. K. Ramanathan, Assistant Dean (Student Welfare) at dsw_scholarships@apextech.edu or visit Room 204 between 3:00 PM and 5:00 PM on working days.`
  },
  {
    id: 'sample-2',
    title: 'Campus Digital Library Repository & Book Return Circular',
    category: 'Hostel & Facilities',
    description: 'Notice with no deadline, policy guidelines, and missing timeline details',
    text: `CENTRAL LIBRARY & LEARNING RESOURCE CENTER
CIRCULAR: LRC/GEN/2026-14
Date of Notification: October 5, 2026

SUBJECT: UTILIZATION OF DIGITAL REPOSITORY AND GENERAL BORROWING REGULATIONS

All students and research scholars are hereby informed that the Central Library has integrated 12,000+ new e-books and IEEE conference proceedings into the institutional intranet portal.

GUIDELINES FOR ACCESS:
1. Students can access the e-portal using their campus LDAP credentials from any campus Wi-Fi network.
2. Physical borrowing limit is 4 books per undergraduate student and 6 books for postgraduate scholars.
3. Reference books, current journal issues, and Master theses marked with red tape are strictly non-circulating and cannot be taken outside the library premises.
4. Silence must be maintained in the Central Reading Hall at all times. Mobile phone conversations are strictly prohibited inside.

RETURN OF BOOKS:
Students possessing overdue books must return them to the circulation counter during library working hours (8:00 AM to 8:00 PM). Overdue charges will be levied at ₹2 per day per volume for standard textbooks.

CONTACT DETAILS:
For remote VPN access issues or catalog assistance, reach out to library_helpdesk@apextech.edu or meet the Circulation In-Charge at Counter No. 2.`
  },
  {
    id: 'sample-3',
    title: 'National Robotics Hackathon "RoboSprint 2026"',
    category: 'Campus Events',
    description: 'Multiple dates: registration cutoff vs abstract submission vs main event date',
    text: `DEPARTMENT OF ELECTRONICS AND MECHATRONICS ENGINEERING
IN ASSOCIATION WITH ROBOTICS CLUB
Ref: ECE/ROBO/2026/EVENT-04
Date: 10th October 2026

ANNOUNCEMENT: ROBOSPRINT 2026 - 36-HOUR NATIONAL ROBOTICS HACKATHON

The Department of EME is pleased to announce the 5th edition of the annual national robotics hackathon "RoboSprint 2026".

TIMELINE OF EVENTS:
1. Registration Opens: 14th October 2026 at 10:00 AM.
2. Team Registration & Online Abstract Submission Deadline: 28th October 2026 by 11:59 PM IST.
3. Announcement of Shortlisted Teams: 2nd November 2026 at 6:00 PM on the departmental portal.
4. Final Hackathon On-Campus Event: The 36-hour physical hackathon commences on 14th November 2026 at 9:00 AM and concludes on 15th November 2026 at 9:00 PM in the Advanced Robotics Lab.

ELIGIBILITY AND TEAM RULES:
- Teams must comprise 3 to 4 members. Inter-departmental and inter-collegiate teams are encouraged.
- All team members must be enrolled undergraduate students with valid college photo ID cards.

REGISTRATION FEE:
- Registration is free for abstract submission.
- Shortlisted teams participating in the physical finals must pay a confirmation fee of ₹1,200 per team on or before 5th November 2026.

PRIZES:
First Prize: ₹50,000 | Runner-up: ₹25,000 | Certificate of Merit for all finalists.

Faculty Coordinator: Prof. S. Venkat (svenkat@apextech.edu).
Student Leads: Rahul Sharma (+91-9876543210), Priya Menon.`
  },
  {
    id: 'sample-4',
    title: 'Odd Semester End Examination Registration & Fee Circular',
    category: 'Examinations',
    description: 'Complex fee structures, late fines, eligibility threshold, and photo submission',
    text: `OFFICE OF THE CONTROLLER OF EXAMINATIONS
APEX INSTITUTE OF TECHNOLOGY
Ref: COE/EXAM/ODD/2026/041
Date: 8th October 2026

CIRCULAR: SEMESTER END EXAMINATIONS (REGULAR & ARREARS) - NOVEMBER 2026

All candidates appearing for the B.Tech / M.Tech Odd Semester Examinations scheduled in November/December 2026 are advised to register through the student ERP portal (https://erp.apextech.edu/exams).

ATTENDANCE ELIGIBILITY:
As per academic regulations, candidates must have a minimum aggregate attendance of 75% in each registered theory and laboratory course. Candidates with attendance between 65% and 74% may apply for condonation on medical grounds upon payment of the prescribed condonation fee of ₹1,000. Candidates having less than 65% attendance are not eligible and will be detained.

FEE PARTICULARS:
- Theory Course Examination Fee: ₹250 per paper.
- Practical / Laboratory Course Fee: ₹350 per course.
- Grade Sheet Fee: ₹150 (Mandatory for all candidates).
- Late Fee with Penalty: ₹500 flat fee for registrations submitted after the regular deadline.

SCHEDULE:
- Portal opens for online payment: 12th October 2026
- Last date to pay exam fees without fine: 22nd October 2026 at 5:00 PM
- Last date to pay exam fees with late fine: 27th October 2026 at 5:00 PM
- Hall tickets download begins: 5th November 2026

MANDATORY PROCEDURES:
After online payment, students must submit a printed copy of the fee receipt along with two recent passport-size photographs to their respective Department Academic Coordinator by 29th October 2026.

Controller of Examinations: coe@apextech.edu | Helpline: 044-22345678.`
  },
  {
    id: 'sample-5',
    title: 'Annual Hostel Maintenance & Room Retention Policy (Notice with Contradictions)',
    category: 'Hostel & Facilities',
    description: 'Contradictory fees and missing dates designed to test AI ambiguity detection',
    text: `CHIEF WARDEN OFFICE — HOSTEL MANAGEMENT COMMITTEE
CIRCULAR NO: HMC/2026/MNT-03
Date: October 2026

SUBJECT: ROOM RETENTION AND SEMESTER BREAK MAINTENANCE FEE

All resident hostel students intending to retain their allotted hostel rooms during the upcoming winter break must comply with the following instructions:

SECTION 1: FEE REQUIREMENTS
All students retaining rooms must deposit a non-refundable maintenance charge of ₹1,500 via the hostel payment desk.
However, as noted in the appendix table below, students staying for internship work are required to pay ₹2,000 for utility charges.
(Note in paragraph 4: "The total maintenance and utility deposit shall be ₹1,800 payable by cash only.")

SECTION 2: TIMELINE AND PROCEDURES
The deadline for room retention application is Friday before the exams commence (Exact calendar date not specified).
Applications submitted after 4:00 PM on the last date will attract an unstated daily surcharge.
Vacation of non-retained rooms must be completed by 15th December 2026.

SECTION 3: CONTRADICTIONS NOTED FOR REVIEW
- Paragraph 1 says payment via hostel payment desk online/card. Paragraph 4 specifies "cash only".
- Retention fee is stated as ₹1,500, ₹2,000, and ₹1,800 in different sections of this notice.
- Application deadline lacks a concrete calendar date.

Approved by Chief Warden.`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SAMPLE_NOTICES;
}
