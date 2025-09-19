import Navbar from "@/components/MainNavbar";
import { FaHeartbeat, FaUserMd, FaStethoscope } from "react-icons/fa";

export const metadata = {
  title: "About Us | ElohApp",
  description:
    "Learn more about ElohApp — our mission, vision, and team dedicated to providing accessible and high-quality telehealth services across Africa.",
};

const About = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen mb-15 bg-gradient-to-br from-[#e0f7fa] to-[#f0f4f8] flex flex-col items-center justify-start text-gray-800 px-6 py-10">
        {/* banner */}
        <div className="w-full absolute top-0 left-0">
          <img
            src="/images/banner2b.png"
            alt="ElohDoc Banner"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="relative z-10 max-w-5xl w-full text-center space-y-8 mt-200">
          {/* Tagline */}
          <h1 className="text-lg md:text-3xl font-extrabold text-black">
            We’re on a mission to become a leading digital healthcare provider with a mission to
            provide Africa with better access and efficient care for everyone.
          </h1>

          {/* About Text */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl text-left space-y-6">
            <h2 className="text-2xl font-bold text-[#0077b6]">Who We Are</h2>
            <p>
              <strong>Elohdoc</strong> is a cutting-edge telehealth platform
              committed to revolutionizing access to medical care across Africa
              and beyond. Whether you're a patient seeking consultation, a nurse
              managing care, or a doctor delivering quality healthcare — Elohdoc
              connects you seamlessly.
            </p>

            <h2 className="text-2xl font-bold text-[#0077b6]">Our Vision</h2>
            <p>
              To be Africa’s leading virtual health companion — delivering care
              with compassion, clarity, and cutting-edge technology.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
              <div className="text-[#00b4d8] text-3xl mb-2">
                <FaUserMd />
              </div>
              <h3 className="text-lg font-semibold mb-1">Expert Doctors</h3>
              <p className="text-sm text-gray-600">
                Consult with licensed, experienced professionals from your
                device.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
              <div className="text-[#00b4d8] text-3xl mb-2">
                <FaStethoscope />
              </div>
              <h3 className="text-lg font-semibold mb-1">Remote Diagnostics</h3>
              <p className="text-sm text-gray-600">
                Accurate medical evaluations and prescriptions — from anywhere.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all">
              <div className="text-[#00b4d8] text-3xl mb-2">
                <FaHeartbeat />
              </div>
              <h3 className="text-lg font-semibold mb-1">Patient First</h3>
              <p className="text-sm text-gray-600">
                We prioritize comfort, trust, and personalized care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
