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

```bash
eloh-doc-app/
├── app/                         # Next.js app directory
│   └── dashboard/               # Role-specific dashboards
│       ├── doctor/              # Doctor views & components
│       ├── nurse/               # Nurse views & components
│       └── patient/             # Patient views & components
├── components/                  # Shared UI and functional components
│   ├── Chat.jsx
│   ├── SaveStripePayment.jsx
│   ├── patients/
│   └── doctors/
├── hooks/                       # Custom React hooks
│   └── useCurrentUser.js
│   └── useSaveMedicalHistory.js
├── pages/                       # API routes & page overrides
│   ├── api/
│   │   ├── stripe/              # Stripe payment handlers
│   │   └── patients/            # Patient API endpoints
│   └── index.jsx
├── public/                      # Static files
├── utils/                       # Utility functions (e.g., token generation, formatting)
├── firebase/                    # Firebase client & admin setup
│   ├── client.ts                # Firebase app initialization
│   └── server.ts                 # Firebase Admin SDK init
├── .env.local                   # Environment variables
├── README.md                    # Project documentation
└── package.json
```



NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# LiveKit Config
NEXT_PUBLIC_LIVEKIT_URL=https://your-livekit-url
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
