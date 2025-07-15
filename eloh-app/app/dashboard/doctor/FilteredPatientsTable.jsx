"use client";

const FilteredPatientsTable = ({ patients }) => {
  if (!patients?.length) return null;

  return (
    <div className="mt-8 w-full max-w-4xl bg-white/5 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/10">
      <table className="w-full text-left text-sm text-gray-100">
        <thead className="bg-white/10 text-gray-300 uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4">Full Name</th>
            <th className="px-6 py-4">ID Number</th>
            <th className="px-6 py-4">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {patients.map((patient, idx) => (
            <tr
              key={idx}
              className="hover:bg-white/50 hover:text-black transition cursor-pointer"
              onClick={() => alert(patient?.fullName)}
            >
              <td className="px-6 py-3">{patient.fullName || "—"}</td>
              <td className="px-6 py-3">{patient.idNumber || "—"}</td>
              <td className="px-6 py-3">{patient.email || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilteredPatientsTable;
