import Navbar from "@/components/MainNavbar";
import { FaHeartbeat, FaStethoscope, FaUserMd } from "react-icons/fa";

export const metadata = {
  title: "Our Team | ElohApp",
  description:
    "Meet the dedicated doctors, nurses, drivers, and support staff behind ElohApp, committed to providing exceptional healthcare and emergency services.",
};

const OurTeam = () => {
  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Alice Johnson",
      role: "Chief Medical Officer",
      description:
        "Leads the medical team and oversees patient care strategies.",
      icon: <FaUserMd className="text-3xl text-[#00b4d8]" />,
    },
    {
      id: 2,
      name: "Nurse Michael Smith",
      role: "Senior Nurse",
      description:
        "Ensures smooth patient care and assists in medical procedures.",
      icon: <FaStethoscope className="text-3xl text-[#00b4d8]" />,
    },
    {
      id: 3,
      name: "Dr. Sarah Lee",
      role: "Telehealth Specialist",
      description: "Provides online consultations and remote diagnostics.",
      icon: <FaHeartbeat className="text-3xl text-[#00b4d8]" />,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-6 py-16">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Our Team
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Meet our dedicated team at ElohApp.
          <span className="text-2xl font-extrabold">
            All data here is mock data and will be updated with real team
            information soon.
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-all text-center"
            >
              <div className="flex justify-center mb-4">{member.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800">
                {member.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OurTeam;
