import Navbar from "@/components/MainNavbar";
import Link from "next/link";
import {
  FaHeartbeat,
  FaStethoscope,
  FaUserMd,
  FaAmbulance,
  FaLaptopMedical,
  FaHandsHelping,
} from "react-icons/fa";

export const metadata = {
  title: "Our Team | ElohApp",
  description:
    "Meet the doctors, nurses, drivers, and healthcare innovators behind ElohApp — united in delivering compassionate, accessible, and world-class telehealth services.",
};

const OurTeam = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Alice Johnson",
      role: "Chief Medical Officer",
      description:
        "Leads our clinical operations and ensures ElohApp delivers safe, effective, and patient-centered healthcare.",
      icon: <FaUserMd className="text-4xl text-[#00b4d8]" />,
    },
    {
      id: 2,
      name: "Nurse Michael Smith",
      role: "Senior Nurse",
      description:
        "Brings over 15 years of experience in emergency and outpatient care, ensuring quality support for every patient.",
      icon: <FaStethoscope className="text-4xl text-[#00b4d8]" />,
    },
    {
      id: 3,
      name: "Dr. Sarah Lee",
      role: "Telehealth Specialist",
      description:
        "Leads ElohApp’s remote consultation program, making healthcare accessible from anywhere, anytime.",
      icon: <FaHeartbeat className="text-4xl text-[#00b4d8]" />,
    },
    {
      id: 4,
      name: "James Daniels",
      role: "Emergency Response Driver",
      description:
        "Coordinates and executes urgent transportation for patients needing immediate medical attention.",
      icon: <FaAmbulance className="text-4xl text-[#00b4d8]" />,
    },
    {
      id: 5,
      name: "Linda Perez",
      role: "Digital Health Coordinator",
      description:
        "Manages the integration of technology in our healthcare delivery, improving efficiency and accessibility.",
      icon: <FaLaptopMedical className="text-4xl text-[#00b4d8]" />,
    },
    {
      id: 6,
      name: "Dr. Ethan Mokoena",
      role: "Community Health Director",
      description:
        "Oversees outreach programs and partnerships to extend ElohApp’s impact into rural and underserved areas.",
      icon: <FaHandsHelping className="text-4xl text-[#00b4d8]" />,
    },
  ];

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#03045e] to-[#023e8a] text-white py-20 px-6 text-center mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Team</h1>
        <p className="max-w-2xl mx-auto text-blue-100 text-base md:text-lg">
          Behind ElohApp is a team of passionate healthcare professionals
          committed to reimagining access to care through technology, empathy,
          and innovation.
        </p>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#03045e] mb-4">
            A Team That Cares Deeply
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            ElohApp was founded on the belief that every person deserves quick,
            reliable, and compassionate access to healthcare — no matter where
            they live. Our diverse team of doctors, nurses, and support staff
            work hand-in-hand to deliver digital-first care experiences that put
            people first.
          </p>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#03045e] mb-10">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                icon: <FaHeartbeat className="text-4xl text-[#00b4d8] mb-4" />,
                title: "Compassion",
                desc: "We treat every patient with empathy, dignity, and respect.",
              },
              {
                icon: (
                  <FaLaptopMedical className="text-4xl text-[#00b4d8] mb-4" />
                ),
                title: "Innovation",
                desc: "We leverage technology to make healthcare more accessible and efficient.",
              },
              {
                icon: (
                  <FaHandsHelping className="text-4xl text-[#00b4d8] mb-4" />
                ),
                title: "Collaboration",
                desc: "We work together — across departments and communities — to save lives.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition duration-300"
              >
                {value.icon}
                <h3 className="text-xl font-semibold text-[#03045e] mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM GRID SECTION */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#03045e] mb-10">
            Dedicated Professionals
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Our multidisciplinary team blends clinical expertise with
            technological innovation to bring healthcare closer to you.
            <span className="block mt-2 text-sm italic text-gray-500">
              (All profiles below are mock data and will be replaced soon.)
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100 hover:-translate-y-1"
              >
                <div className="flex justify-center items-center bg-[#e0f7ff] w-20 h-20 rounded-full mb-5 shadow-inner">
                  {member.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-[#00b4d8] font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-[#03045e] text-white py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Join Our Mission
        </h2>
        <p className="max-w-xl mx-auto text-blue-100 mb-8">
          We’re always seeking passionate professionals who believe in
          transforming healthcare access. Be part of something bigger — be part
          of ElohApp.
        </p>
        <Link
          href="/contact"
          className="bg-[#00b4d8] hover:bg-[#009fc3] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
        >
          Contact Us
        </Link>
      </section>
    </>
  );
};

export default OurTeam;
