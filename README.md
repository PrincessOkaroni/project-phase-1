## AfyaRekodi - Patient Tracker

## Description
AfyaRekodi is a web-based patient management system designed for healthcare facilities. It streamlines patient registration, examination, lab processing, review, and drug dispensing workflows. The system supports multiple user roles (Receptionist, Doctor, Lab Technician, Pharmacist) and includes features like patient search, visit tracking, SMS reminders via Elimu.IO SMS API, and a visit frequency chart.
Features

Role-Based Access:
Receptionist: Register and edit patient details.
Doctor: Examine patients, record diagnoses, and review lab results.
Lab Technician: Process lab tests and record results.
Pharmacist: Dispense medications.


Patient Workflow:
Register → Examine → Lab/Pharmacy → Review → Dispense → Optional Next Visit with SMS reminder.


Patient Management:
Add, edit, and delete patient records.
Search patients by name or ID.
View patient visit history and status.


SMS Notifications: Automated reminders for upcoming visits using Elimu.IO SMS API.
Visit Chart: Bar chart visualizing patient visit frequency using Chart.js.
Responsive Design: Mobile-friendly UI with Tailwind-inspired styling.
Feedback: Success and error messages for all actions using SweetAlert2.
Accessibility: Includes aria-label attributes for screen reader support.

Prerequisites

Node.js: For running the JSON Server backend.
Live Server: For serving the frontend (e.g., VS Code Live Server extension).
Elimu.IO SMS API Key: For sending SMS notifications (obtain from Elimu.IO).
Browser: Modern browser (Chrome, Firefox, Edge) with JavaScript enabled.

## Installation

Clone the Repository:
git clone <repository-url>
cd afyarekodi


Install JSON Server:
npm install -g json-server


Set Up Elimu.IO SMS API:

Obtain an API key from Elimu.IO.
Update script.js with your API key:const ELIMU_API_KEY = 'YOUR_ELIMU_API_KEY';




## Project Structure:
afyarekodi/
├── db.json
├── index.html
├── script.js
├── styles.css
└── README.md



Setup

Start JSON Server:Run the backend server to handle patient and user data:
json-server --watch db.json --port 3000

The server will be available at http://localhost:3000.

Serve the Frontend:Open index.html using a live server (e.g., VS Code Live Server) or a local web server like:
npx http-server

Access the app at http://localhost:8080 (port may vary).

Verify Dependencies:The app uses CDN-hosted libraries:

Chart.js (4.4.2) for visit frequency chart.
SweetAlert2 (11.10.5) for alerts.
Font Awesome (6.4.0) for icons.
Google Fonts (Roboto) for typography.Ensure internet access to load these dependencies.



## Usage

Login/Signup:

Signup: Enter a unique username, password, and select a role (Receptionist, Doctor, Lab Technician, Pharmacist). Example:
Username: doctor1, Password: pass123, Role: Doctor.


Login: Use existing credentials (stored in db.json or localStorage).
Success: Displays role-specific UI with a success alert.
Error: Shows error alerts for invalid credentials or duplicate usernames.


## Patient Management:

Add Patient (Receptionist):
Enter Name, ID Number, Age (0-150), Gender, Phone (+2547xxxxxxxx).
Example: Mary Wanjiku, KE123456, 30, Female, +254723456789.
Success: Patient added, redirects to examination.
Error: Alerts for duplicate ID, invalid phone, or age.


Edit Patient (All roles):
Click “Edit” on a patient card, update details, save.
Success: Updates patient, returns to patient list.
Error: Alerts for invalid inputs.


Delete Patient (All roles):
Click “Delete” on a patient card, confirm deletion.
Success: Removes patient, updates list and chart.
Error: Alerts if patient not found.




## Workflow:

Examine (Doctor):
Enter Patient ID, Weight (kg), Height (0-10 ft), BP (e.g., 120/80), Diagnosis, Notes, Next Step (Lab/Pharmacy).
Success: Records examination, redirects to lab or pharmacy.
Error: Alerts for invalid inputs or wrong status.


Lab Process (Lab Technician):
Enter Patient ID, Test Type, Results, Diagnosis.
Success: Records results, redirects to review.
Error: Alerts for invalid inputs or wrong status.


Review (Doctor):
Enter Patient ID, Final Diagnosis, Prescription, Optional Notes, and Next Visit (date/reason).
Success: Records review, sends SMS if next visit is scheduled, redirects to dispensing.
Error: Alerts for invalid inputs or wrong status.


Dispense (Pharmacist):
Enter Patient ID, Drugs Dispensed.
Success: Records dispensing, returns to patient list.
Error: Alerts for invalid inputs or wrong status.




Search:

Select filter (Name/ID), enter query, click Search.
Displays matching patients or “Patient doesn’t exist”.


## SMS Notifications:

Automatically sends reminders for next visits within 1 day (e.g., “Dear Mary Wanjiku, your next visit is on 2025-07-02. Reason: BP check. Contact: +254723456789”).
Manual SMS via “Send SMS Reminder” button on patient card.
Success: Alerts “SMS sent to [Name]!”.
Error: Alerts with failure reason.


## Visit Chart:

Displays a bar chart of visit counts per patient.
Updates automatically after adding, editing, or deleting patients.


## Testing

Login/Signup:

Signup with nurse1, pass123, Receptionist. Verify success alert.
Login with doctor1, pass123, Doctor. Verify role-specific UI.
Try duplicate signup or wrong password. Verify error alerts.


## Patient Workflow:

As Receptionist, add patient KE999999, Jane Doe, 25, Female, +254734567890.
As Doctor, examine with height 5.5 ft, weight 55 kg, BP 120/80, diagnosis Fever, next step could be either be lab or pharmacy
As Lab Technician, process lab for KE999999, test type Blood Test, results Positive, diagnosis Malaria.
As Doctor, review with diagnosis Confirmed Malaria, prescription Artemether.
As Pharmacist, dispense Artemether.
Schedule next visit for 2025-07-03, reason Follow-up. Verify SMS.

## Author
OKaroni Purity
github "https://github.com/PrincessOkaroni"
project overview "https://www.loom.com/share/3ba02b16965f4426b0bad30678e6d356?sid=16a99747-316e-4e7d-b3ab-d903717cd113"

## Licence
MIT License

Copyright (c) 2025 AfyaRekodi. All Rights Reserved.