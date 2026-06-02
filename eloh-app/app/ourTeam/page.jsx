import Navbar from "@/components/MainNavbar";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Team | ElohApp",
  description:
    "Meet the dedicated team behind ElohApp — passionate professionals committed to delivering accessible, high-quality telehealth services across Africa.",
};

const OurTeamPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Winile Nkosi",
      role: "Radiologist",
      description: `Dr. Winile Nkosi is an interventional radiologist. Her areas of strong interest and expertise include:
                   Interventional radiology focused on combining advanced diagnostic capabilities with minimally invasive therapeutic procedures to improve patient outcomes.
                    Dr. Nkosi holds a Master of Medicine in Radiology (MMed Rad D) and a Fellowship of the College of Radiologists (FC Rad Diag, SA). She has a special interest in creating more health equity in Africa.`,
      image: "/images/Dr.WinileNkosi.jpeg",
    },
    {
      id: 3,
      name: "Joe Phalwane",
      role: "Co-Founder & CEO",
      description:
        "Joe Phalwane is a multiple award-winning entrepreneur with extensive international business experience spanning technology and strategic leadership. Over the past decade, Joe has successfully founded and led ventures across Africa and abroad, focusing on creating impactful, tech-driven solutions that address real-world challenges.",
      image: "/images/JoePhalwane.jpeg",
    },
    {
      id: 4,
      name: "Tshepo Masilo",
      role: "Co-Founder & Lead Developer",
      description:
        "Qualified software developer with 2 years experience, robust background in leadership management, and more than 6 years entrepreneurship. Very talented at crafting intuitive design structures and architectural frameworks. As a natural optimist committed to integrity and collaboration, he aims to bring innovation, leadership, and technical proficiency to the forefront of the venture.",
      image: "/images/tshepo.jpeg",
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
          <h2 className="text-3xl font-bold text-[#03045e] mb-5">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                title: "Compassion",
                desc: "We treat every patient with empathy, dignity, and respect.",
              },
              {
                title: "Innovation",
                desc: "We leverage technology to make healthcare more accessible and efficient.",
              },
              {
                title: "Collaboration",
                desc: "We work together — across departments and communities — to save lives.",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition duration-300"
              >
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
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-10">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100 hover:-translate-y-1"
              >
                <div className="relative w-24 h-24 mb-5 rounded-full overflow-hidden shadow-md border-4 border-[#e0f7ff]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="100%"
                    className="object-cover"
                  />
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

export default OurTeamPage;
