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
      {/* Main Navigation */}
      <Navbar />

      {/* Page Container */}
      <div className="relative min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#f0f4f8] flex flex-col items-center justify-start text-gray-800 px-4 sm:px-6 md:px-8 lg:px-10 pb-10">

        {/* Banner Section */}
        <div className="w-full absolute top-0 left-0">
          <img
            src="/images/banner2b.png"
            alt="ElohDoc Banner"
            className="w-full h-48 sm:h-60 md:h-72 lg:h-80 xl:h-96 object-cover"
          />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-6xl text-center space-y-8 pt-56 sm:pt-60 md:pt-72 lg:pt-80">

          {/* Tagline */}
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-black leading-snug px-2 sm:px-4">
            We’re on a mission to become a leading digital healthcare provider —
            giving Africa better access to efficient care for everyone.
          </h1>

          {/* About & Vision Section */}
          <div className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-xl text-left space-y-6 mx-auto max-w-4xl">
            {/* Who We Are */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#0077b6]">Who We Are</h2>
            <p className="text-sm sm:text-base">
              <strong>Elohdoc</strong> is a cutting-edge telehealth platform
              committed to revolutionizing access to medical care across Africa
              and beyond. Whether you're a patient seeking consultation, a nurse
              managing care, or a doctor delivering quality healthcare —
              Elohdoc connects you seamlessly.
            </p>

            {/* Our Vision */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#0077b6]">Our Vision</h2>
            <p className="text-sm sm:text-base">
              To be Africa’s leading virtual health companion — delivering care
              with compassion, clarity, and cutting-edge technology.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-2">
            {/* Feature 1 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
              <div className="text-[#00b4d8] text-3xl mb-3 flex justify-center sm:justify-start">
                <FaUserMd />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Expert Doctors</h3>
              <p className="text-xs sm:vdtext-sm text-gray-600">
                Consult with licensed, experienced professionals from your
                device.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
              <div className="text-[#00b4d8] text-3xl mb-3 flex justify-center sm:justify-start">
                <FaStethoscope />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Remote Diagnostics</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Accurate medical evaluations and prescriptions — from anywhere.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-lg transition-all duration-300">
              <div className="text-[#00b4d8] text-3xl mb-3 flex justify-center sm:justify-start">
                <FaHeartbeat />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Patient First</h3>
              <p className="text-xs sm:text-sm text-gray-600">
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
