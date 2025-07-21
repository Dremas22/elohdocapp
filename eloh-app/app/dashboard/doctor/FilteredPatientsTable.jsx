"use client";

const FilteredPatientsTable = ({
  patients,
  setOpenViewPatientRecords,
  setSelectedPatient,
}) => {
  if (!patients?.length) return null;

  return (
    <div className="mt-8 w-full max-h-[60vh] sm:max-h-none overflow-y-auto overflow-x-auto">
      <div className="min-w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
        <table className="min-w-[600px] w-full text-left text-sm text-gray-100">
          <thead className="bg-white/10 text-gray-300 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Full Name</th>
              <th className="px-6 py-4 whitespace-nowrap">ID Number</th>
              <th className="px-6 py-4 whitespace-nowrap">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {patients.map((patient, idx) => (
              <tr
                key={idx}
                className="hover:bg-white/50 hover:text-black transition cursor-pointer"
                onClick={() => {
                  setSelectedPatient(patient);
                  setOpenViewPatientRecords(true);
                }}
              >
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.fullName || "—"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.idNumber || "—"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  {patient.email || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FilteredPatientsTable;
