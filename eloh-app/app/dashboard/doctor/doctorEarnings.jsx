"use Client";

const Earnings = ({ data }) => {
  const numberOfConsultations = data?.numberOfConsultations ?? 0;
  const earnings = data?.earnings ?? 0;
  const totalPlatformFees = data?.totalPlatformFees ?? 0;
  return (
    <div className="text-[#66e4ff] flex flex-col md:flex-row items-center justify-center gap-8 p-8 w-auto md:w-full">
      {/* Consultations Card */}
      <div
        className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full md:w-1/2 text-center
                      transform transition-transform duration-300 hover:scale-100 hover:shadow-[#0d6efd]/50 cursor-default"
      >
        <h1 className="text-xl font-semibold mb-3 tracking-wide text-[#66e4ff] drop-shadow-md">
          Number of Consultations:
        </h1>

        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
          {numberOfConsultations}
        </h2>
        <p className="mt-2 text-sm text-[#a0cfff]">This month</p>
      </div>

      {/* Earnings Card */}
      <div
        className="bg-gradient-to-br from-[#0b2345] to-[#123158] p-4 rounded-2xl shadow-2xl w-full md:w-1/2 text-center
                      transform transition-transform duration-300 hover:scale-100 hover:shadow-[#0d6efd]/50 cursor-default"
      >
        <h1 className="text-xl font-semibold mb-3 tracking-wide text-[#66e4ff] drop-shadow-md">
          Total Monthly Earnings:
        </h1>
        <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
          R {earnings.toFixed(2)}
        </h2>
        <p className="mt-2 text-sm text-[#a0cfff]">
          Based on completed consultations
        </p>
        {/* Subtle platform fee line */}
        <p className="mt-1 text-xs text-[#88c2ff] italic">
          Platform fees deducted: R {totalPlatformFees.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Earnings;
