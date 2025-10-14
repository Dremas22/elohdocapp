import { FaCheck } from "react-icons/fa";

const Subscriptions = () => {
  return (
    <section className="bg-gray-50 py-16">
      {/* Header Section */}
      <div className="text-center mb-12 px-4">
        <p className="text-sm font-semibold text-blue-600 tracking-wide">
          AFFORDABLE HEALTHCARE
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mt-2">
          Our Packages
        </h2>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          ElohDoc provide flexible subscription plans for both nurse and doctor
          consultations to make healthcare accessible for everyone. Choose a
          package that suits your needs and budget — with secure payment options
          and no hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {/* Nurse Consultation (Individual) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-sky-600 to-blue-500 p-6 text-white relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Individual Nurse Consultation
              </h3>
              <span className="text-xs bg-white/30 px-3 py-1 rounded-full font-medium">
                Most Affordable
              </span>
            </div>
            <div className="mt-6">
              <p className="text-4xl font-extrabold">R99</p>
              <p className="text-sm">/ Month</p>
              <p className="text-sm mt-2 opacity-90">OR</p>
              <p className="text-lg font-semibold mt-1">R1000 / Year</p>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-600" /> Unlimited Nurse
                Consultations
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-600" /> Nurse’s Prescription
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-600" /> Medical Certificate / Sick
                Note
              </li>
            </ul>
          </div>
        </div>

        {/* Family Package (Mixed Nurses & Doctors) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white">
            <h3 className="text-lg font-semibold">
              Family Consultation (Family of 6)
            </h3>
            <div className="mt-6">
              <p className="text-4xl font-extrabold">R249</p>
              <p className="text-sm">/ Month</p>
              <p className="text-sm mt-2 opacity-90">OR</p>
              <p className="text-lg font-semibold mt-1">R2500 / Year</p>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-700" /> Nurse & Doctor
                Consultations
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-700" /> Prescription Support
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-700" /> Family Health Monitoring
              </li>
            </ul>
          </div>
        </div>

        {/* Doctor Consultation (Once-Off) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-800 to-sky-700 p-6 text-white">
            <h3 className="text-lg font-semibold">
              Once-Off Doctor Consultation
            </h3>
            <div className="mt-6">
              <p className="text-4xl font-extrabold">R99</p>
              <p className="text-sm">/ Once-off</p>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-800" /> One Doctor Consultation
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-800" /> Doctor’s Prescription
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-blue-800" /> Medical Certificate / Sick
                Note
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscriptions;
