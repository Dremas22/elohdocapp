import Image from "next/image";
import Navbar from "@/components/MainNavbar";
import Footer from "../forCompanies/footer";

export const metadata = {
  title: "About Us | ElohApp",
  description:
    "Learn more about ElohApp — our mission, vision, and team dedicated to providing accessible and high-quality telehealth services across Africa.",
};

const AboutUs = () => {
  return (
    <main className="w-full bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/about.jpg"
            alt="About us Hero"
            fill
            className="object-cover opacity-80"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Text over hero */}
        <div className="relative z-10 text-center px-6 md:px-0">
          <h1 className="text-white text-3xl md:text-5xl font-bold">
            About Us
          </h1>
          <p className="mt-4 text-white text-base md:text-lg max-w-2xl mx-auto">
            We provide telehealth solutions tailored to businesses, enabling
            your employees to access healthcare seamlessly.
          </p>
        </div>
      </section>

      {/* Content Section: What We Offer */}
      <section className="py-20 px-6 md:px-0 md:w-[75%] mx-auto">
        <div className="mt-12 flex flex-col gap-16">
          {/* 1st item */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-1/2 h-[250px]">
              <Image
                src="/images/telemedicine.jpg"
                alt="Corporate Telemedicine"
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                About ElohDoc
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-2">
                Corporate Telemedicine
              </h3>
              <p className="mt-3 text-gray-600">
                We fully understand the importance of timely access to
                healthcare services, which is why <strong>ElohDoc</strong> is
                committed to providing convenience and efficiency at every step.
                <br />
                <br />
                Whether you need preventive care, immediate attention for acute
                conditions, or continuous management of chronic illnesses, our
                platform ensures smooth and secure access to experienced
                healthcare professionals.
                <br />
                <br />
                By harnessing innovation and the power of technology,{" "}
                <strong>ElohDoc</strong> is breaking barriers and empowering
                individuals to receive quality medical care anytime, anywhere —
                regardless of distance or circumstance.
              </p>
            </div>
          </div>

          {/* 2nd item */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold text-gray-800">
                Leveraging International Medical Experience
              </h3>
              <p className="mt-3 text-gray-600">
                We set ourselves apart from other healthcare providers by
                employing local doctors, clinical associates, and nurses on a
                full-time basis, guaranteeing immediate access to
                teleconsultation services at the most affordable rates.
                <br />
                <br />
                With a combined experience of over a century in the healthcare
                field, <strong>ElohDoc</strong> stands as a trusted and reliable
                partner for delivering comprehensive, patient-centered care.
              </p>
            </div>
            <div className="relative w-full md:w-1/2 h-[250px]">
              <Image
                src="/images/doctors.jpg"
                alt="Wellness Programs"
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* 3rd item */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-1/2 h-[250px]">
              <Image
                src="/images/consultation.jpg"
                alt="Analytics & Insights"
                fill
                className="object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold text-gray-800">
                Analytics & Insights
              </h3>
              <p className="mt-3 text-gray-600">
                Access anonymized health trends and reporting to guide your
                corporate health strategy and improve workplace wellness
                outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Team Section */}
      <section className="py-20 bg-gradient-to-b from-[#e0f2fe] to-[#f8fafc]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#023e8a]">
            Meet Our Executive Team
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our leadership team combines global expertise and local insight,
            driving ElohDoc’s mission to make healthcare accessible, efficient,
            and patient-focused.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 px-6 md:px-0">
          {/* Team Member 1 */}
          <div className="bg-white rounded-2xl shadow-lg w-[260px] text-center overflow-hidden border border-blue-100 hover:shadow-xl transition">
            <div className="w-full h-64 relative">
              <Image
                src="/images/default_avatar.jpg"
                alt="Mr. Letlhake Kealeboga"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] h-full text-white">
              <h3 className="text-lg font-semibold">Mr. Letlhake Kealeboga</h3>
              <p className="text-sm">Non-Executive Chairperson of the Board</p>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-2xl shadow-lg w-[260px] text-center overflow-hidden border border-blue-100 hover:shadow-xl transition">
            <div className="w-full h-64 relative">
              <Image
                src="/images/default_avatar.jpg"
                alt="Dr. Tshepo Masilo"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] h-full text-white">
              <h3 className="text-lg font-semibold">Dr. Tshepo Masilo</h3>
              <p className="text-sm">Co-Founder & Executive Director</p>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-2xl shadow-lg w-[260px] text-center overflow-hidden border border-blue-100 hover:shadow-xl transition">
            <div className="w-full h-64 relative">
              <Image
                src="/images/default_avatar.jpg"
                alt="Nurse Nelson Malgas"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] h-full text-white">
              <h3 className="text-lg font-semibold">Nurse Nelson Malgas</h3>
              <p className="text-sm">Medical Director </p>
            </div>
          </div>

          {/* Team Member 4 */}
          <div className="bg-white rounded-2xl shadow-lg w-[260px] text-center overflow-hidden border border-blue-100 hover:shadow-xl transition">
            <div className="w-full h-64 relative">
              <Image
                src="/images/default_avatar.jpg"
                alt="Mr. Joe Phalwane"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] h-full text-white">
              <h3 className="text-lg font-semibold">Mr. Joe Phalwane</h3>
              <p className="text-sm">Co-Founder & Executive Director</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AboutUs;
