# TODO - Course Completion Certificate System

## Confirmed Scope

- **Course completion certificates only** (admin generates after approving a capstone)
- Details pulled dynamically from DB (student, course, capstone)
- PDF via pdfkit + qrcode (already installed, no new libs)
- Full backend + frontend, responsive, optimized, proper folder structure

## Backend Steps

- [ ] Add `certificateIssued` flag to CapstoneSubmission model
- [ ] Create `backend/src/utils/certificateGenerator.js` (pdfkit + qrcode PDF builder)
- [ ] Create `backend/src/controllers/admin/adminCertificateController.js` (preview, send, list)
- [ ] Create `backend/src/routes/admin/adminCertificate.routes.js`
- [ ] Create `backend/src/controllers/student/studentCertificateController.js` (list, download)
- [ ] Create `backend/src/routes/student/studentCertificate.routes.js`
- [ ] Mount routes in `backend/src/app.js`
- [ ] Add `certificatesCount` to student dashboard in `studentController.js`

## Frontend Steps

- [ ] Create admin certificate feature (Api, Thunks, Slice)
- [ ] Create student certificate feature (Api, Thunks, Slice)
- [ ] Create `frontend/src/pages/admin/certificates/Certificates.jsx` + module.css
- [ ] Create `frontend/src/pages/student/Certificates.jsx` + module.css (2 columns + PDF download)
- [ ] Add "Generate Certificate" button + preview modal in CapstoneReview.jsx
- [ ] Add Certificates link to AdminSidebar.jsx and StudentSidebar.jsx
- [ ] Register reducers in store.js
- [ ] Add routes in router.jsx
- [ ] Verify build + functionality
