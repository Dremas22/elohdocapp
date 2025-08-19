# 🏥 Eloh Doc App

Eloh Doc is a modern full-stack healthcare platform built for **Doctors**, **Nurses**, and **Patients**. It provides a secure, cloud-based environment for virtual consultations, medical record management, and real-time collaboration between medical staff and patients.

---

## 🩺 About Eloh Doc

Eloh Doc empowers healthcare delivery through telemedicine and digital workflows. It supports video consultations, secure messaging, medical data access, and payment handling — all accessible via a web browser.

The platform is optimized for:
- Doctors conducting virtual appointments and tracking earnings
- Nurses accessing patient records (with verified access)
- Patients scheduling consultations and reviewing their history

---

## 🚀 Key Features

### 👨‍⚕️ Doctors
- View appointments and manage patients
- Start video consultations via **LiveKit**
- Track earnings and manage consultation availability
- Add, edit, and review medical notes

### 👩‍⚕️ Nurses
- Verified nurses can access the full medical history of patients
- Join patient consultations via **LiveKit**
- Collaborate on shared care plans

### 🧑 Patients
- Book and attend online consultations
- Securely pay for services using **Stripe**
- Access health records, chat with providers, and receive updates

---

## 🔒 Authentication & Security

- **Firebase Authentication** for secure sign-in and role-based access control
- **Firebase Admin SDK** (server-side) for privileged operations (e.g. role checks, access control)
- Role-based data access ensures patient privacy and compliance

---

## 📹 LiveKit Integration

Eloh Doc uses [LiveKit](https://livekit.io/) for secure, high-quality video/audio rooms:

- Real-time doctor-patient-nurse communication
- Browser-based meeting rooms with mute, camera toggle, and screen sharing
- LiveKit tokens are securely generated using Firebase Admin

---

## 💳 Stripe Integration

- Integrated with **Stripe Checkout** for seamless patient payments
- Payment success is tracked and saved in Firestore
- Dashboard updates dynamically after successful payments

---

## 🧰 Tech Stack

| Layer          | Technology                      |
|----------------|----------------------------------|
| Frontend       | Next.js, React, TailwindCSS      |
| Backend        | Firebase Functions, Firestore    |
| Auth           | Firebase Auth, Firebase Admin    |
| Video          | LiveKit                          |
| Payments       | Stripe                           |
| Notifications  | Firebase Cloud Messaging (FCM)   |
| Deployment     | Vercel, Firebase Hosting         |

---

## 📁 File Structure

# File Tree: eloh-app

```
├── 📁 .next/ 🚫 (auto-hidden)
├── 📁 app/
│   ├── 📁 about/
│   │   └── 📄 page.jsx
│   ├── 📁 ambulance/
│   │   ├── 📁 customers/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 drivers/
│   │   │   └── 📄 page.jsx
│   │   └── 📄 page.jsx
│   ├── 📁 api/
│   │   ├── 📁 ambulance/
│   │   │   ├── 📁 customers/
│   │   │   │   └── 📁 [customerId]/
│   │   │   │       └── 📄 route.js
│   │   │   └── 📁 drivers/
│   │   │       └── 📁 [driverId]/
│   │   │           └── 📄 route.js
│   │   ├── 📁 check-registration/
│   │   │   └── 📄 route.js
│   │   ├── 📁 diagnose/
│   │   │   └── 📄 route.js
│   │   ├── 📁 doctor/
│   │   │   └── 📁 toggle-availability/
│   │   │       └── 📄 route.js
│   │   ├── 📁 end-consultation/
│   │   │   └── 📄 route.js
│   │   ├── 📁 get-latest-note/
│   │   │   └── 📄 route.js
│   │   ├── 📁 notify-doctor/
│   │   │   └── 📄 route.js
│   │   ├── 📁 patients/
│   │   │   ├── 📁 [patientId]/
│   │   │   │   └── 📄 route.js
│   │   │   ├── 📁 get-all-notes/
│   │   │   │   └── 📄 route.js
│   │   │   ├── 📁 get-medical-records/
│   │   │   │   └── 📄 route.js
│   │   │   └── 📁 update-history/
│   │   │       └── 📄 route.js
│   │   ├── 📁 register-user/
│   │   │   └── 📄 route.js
│   │   ├── 📁 save-ai-diagnosis/
│   │   │   └── 📄 route.js
│   │   ├── 📁 send-ambulance-notification/
│   │   │   └── 📄 route.js
│   │   ├── 📁 session/
│   │   │   └── 📄 route.js
│   │   ├── 📁 stripe-checkout/
│   │   │   └── 📄 route.js
│   │   ├── 📁 stripe-subscription/
│   │   │   └── 📄 route.js
│   │   ├── 📁 token/
│   │   │   └── 📄 route.js
│   │   ├── 📁 users/
│   │   │   └── 📁 update/
│   │   │       └── 📄 route.js
│   │   └── 📁 verify/
│   │       └── 📄 route.js
│   ├── 📁 contact/
│   │   └── 📄 page.jsx
│   ├── 📁 dashboard/
│   │   ├── 📁 customer/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 doctor/
│   │   │   ├── 📄 DoctorsCollectionViewer.jsx
│   │   │   ├── 📄 FilteredPatientsTable.jsx
│   │   │   ├── 📄 doctorEarnings.jsx
│   │   │   ├── 📄 doctorNav.jsx
│   │   │   ├── 📄 doctorSidebar.jsx
│   │   │   ├── 📄 doctorToggleBtn.jsx
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 driver/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 nurse/
│   │   │   ├── 📄 NurseCollectionViewer.jsx
│   │   │   ├── 📄 nurseNav.jsx
│   │   │   ├── 📄 nurseSidebar.jsx
│   │   │   └── 📄 page.jsx
│   │   └── 📁 patient/
│   │       ├── 📄 page.jsx
│   │       ├── 📄 patientNav.jsx
│   │       └── 📄 patientSidebar.jsx
│   ├── 📁 onboarding/
│   │   ├── 📁 customer/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 doctor/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 driver/
│   │   │   └── 📄 page.jsx
│   │   ├── 📁 nurse/
│   │   │   └── 📄 page.jsx
│   │   └── 📁 patient/
│   │       └── 📄 page.jsx
│   ├── 📁 payment/
│   │   └── 📄 page.jsx
│   ├── 📁 room/
│   │   └── 📄 page.jsx
│   ├── 📁 sign-in/
│   │   └── 📄 page.jsx
│   ├── 🖼️ favicon.ico
│   ├── 🎨 globals.css
│   ├── 📄 layout.jsx
│   └── 📄 page.jsx
├── 📁 components/
│   ├── 📁 ambulance/
│   │   ├── 📁 customers/
│   │   │   └── 📄 CustomerRegistrationForm.jsx
│   │   ├── 📁 drivers/
│   │   │   └── 📄 DriversRegistrationForm.jsx
│   │   ├── 📄 AmbulanceLandingPage.jsx
│   │   └── 📄 PayAmbulance.jsx
│   ├── 📁 doctors/
│   │   ├── 📄 DoctorsRegistrationForm.jsx
│   │   ├── 📄 SearchBar.jsx
│   │   └── 📄 viewPatientsRecords.jsx
│   ├── 📁 editor/
│   │   ├── 📄 DownloadButton.jsx
│   │   ├── 📄 MeetingRoomNavbar.jsx
│   │   ├── 📄 NotePreview.jsx
│   │   ├── 📄 PrescriptionForm.jsx
│   │   ├── 📄 SickNoteForm.jsx
│   │   ├── 📄 SignaturePad.jsx
│   │   └── 📄 TextEditor.jsx
│   ├── 📁 maps/
│   │   ├── 📄 CustomerMap.jsx
│   │   └── 📄 DriverMap.jsx
│   ├── 📁 nurses/
│   │   ├── 📄 NurseAvailbilityBtn.jsx
│   │   └── 📄 NursesRegistrationForm.jsx
│   ├── 📁 patients/
│   │   ├── 📁 cards/
│   │   │   ├── 📄 DoctorsList.jsx
│   │   │   └── 📄 NursesList.jsx
│   │   ├── 📁 forms/
│   │   │   ├── 📄 Step1BasicInfo.jsx
│   │   │   ├── 📄 Step2ContactInfo.jsx
│   │   │   ├── 📄 Step3SocialHistory.jsx
│   │   │   ├── 📄 Step4Allergies.jsx
│   │   │   └── 📄 Step5MedicalHistory.jsx
│   │   ├── 📁 payments/
│   │   │   ├── 📄 payOptions.jsx
│   │   │   ├── 📄 payToDoctor.jsx
│   │   │   └── 📄 payToNurse.jsx
│   │   ├── 📄 FullMedicalRecords.jsx
│   │   ├── 📄 NoteList.jsx
│   │   ├── 📄 PatientDisplay.jsx
│   │   ├── 📄 PatientMeetingSetup.jsx
│   │   ├── 📄 PatientsRegistrationForm.jsx
│   │   ├── 📄 ProgressBar.jsx
│   │   ├── 📄 SocialHistorySection.jsx
│   │   ├── 📄 StaffController.jsx
│   │   └── 📄 ToggleMedicalSection.jsx
│   ├── 📁 video-conferencing/
│   │   ├── 📄 MeetingRoom.jsx
│   │   ├── 📄 PatientCloseMeetingButton.jsx
│   │   └── 📄 StaffCloseMeetingButton.jsx
│   ├── 📄 AmbulanceButton.jsx
│   ├── 📄 Chat.jsx
│   ├── 📄 LandingPage.jsx
│   ├── 📄 LanguageSelector.jsx
│   ├── 📄 Loading.jsx
│   ├── 📄 NotificationModal.jsx
│   ├── 📄 ProfileModal.jsx
│   ├── 📄 SaveStripePayment.js
│   ├── 📄 SignInWithGoogleBtn.jsx
│   ├── 📄 calendar.jsx
│   ├── 📄 maiNavbar.jsx
│   ├── 📄 selection.jsx
│   ├── 📄 signInOrSignUpForm.jsx
│   ├── 📄 video.jsx
│   └── 📄 viewMedicalRecords.jsx
├── 📁 constants/
│   └── 📄 index.js
├── 📁 db/
│   ├── 📄 client.js
│   └── 📄 server.js
├── 📁 helpers/
│   ├── 📄 index.js
│   └── 📄 toastHelper.js
├── 📁 hooks/
│   ├── 📄 useCurrentUser.js
│   └── 📄 useSaveMedicalHistory.js
├── 📁 lib/
│   ├── 📁 ambulance-actions/
│   │   ├── 📄 createAmbulanceMarker.js
│   │   └── 📄 createCustomerMarker.js
│   ├── 📄 convertFirebaseDate.js
│   ├── 📄 convertOKLCHtoRGB.js
│   ├── 📄 getFCMToken.js
│   ├── 📄 postMeetingUpdates.js
│   ├── 📄 queries.js
│   ├── 📄 session-signout.js
│   └── 📄 truncate.js
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 public/
│   ├── 📁 images/
│   │   ├── 🖼️ deafult_avatar.jpg
│   │   ├── 🖼️ elohdoc.png
│   │   ├── 🖼️ star_of_life.png
│   │   └── 🖼️ wasalaLogo.png
│   ├── 📁 videos/
│   │   └── 📄 elohdocvid.mp4
│   └── 📄 firebase-messaging-sw.js
├── 📁 utils/
│   └── 📄 validateForm.js
├── 🔒 .env 🚫 (auto-hidden)
├── 🚫 .gitignore
├── 📖 README.md
├── 📄 jsconfig.json
├── 📄 middleware.js
├── 📄 next.config.mjs
├── 📄 package-lock.json
├── 📄 package.json
└── 📄 postcss.config.mjs
```

---

### ================================
### 🏥 Eloh Doc App Environment Variables
### ================================

### 🔗 Frontend Configuration

```
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=bvjhb
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nfvjv hb
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nhfhgvb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jhtgjmb
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=nfgjhmnb
NEXT_PUBLIC_FIREBASE_APP_ID=hthkn
NEXT_PUBLIC_FIREBASE_MEASURE_ID=ghctg jb
NEXT_PUBLIC_FIREBASE_VAPID_KEY=gjhgb mbfZPdnuNf724Ng1PF8ET6SNQJFJ9x8diuPfdzgT4FeSRKg_K4wtbHvDBGSRpJWSXE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=vgjgb
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=dhgfgasjc
NEXT_PUBLIC_EMAIL_JS_SERVICE_ID=sdhvhgb
NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID=sdhgvb
NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY=hsdgvbk
NEXT_PUBLIC_LIVEKIT_URL=hdggfcaj

### 🔐 Backend / Server Configuration
FIREBASE_PROJECT_ID=hrrfvjg
FIREBASE_CLIENT_EMAIL=ku,hm
FIREBASE_PRIVATE_KEY="nhgfvmjhvumnvumhv n
FIREBASE_PRIVATE_KEY_ID=nbfvmhhbn
FIREBASE_CLIENT_ID= nfv nb
FIREBASE_AUTH_URI=gfhn
FIREBASE_TOKEN_URI=hfhgvh hmh
FIREBASE_AUTH_PROVIDER_CERT_URL=ytgcwrs
FIREBASE_CLIENT_CERT_URL=ffgdva hcnb
FIREBASE_UNIVERSE_DOMAIN=hgdg
FIREBASE_TYPE=service_account

LIVEKIT_API_KEY=sdfgk
LIVEKIT_API_SECRET=dsbngvikqjb
LIVEKIT_URL=bsgvukjb

STRIPE_SECRET_KEY=djfgjz

OPENROUTER_API_KEY=sk-or-v1-cgvsdujn d
```


