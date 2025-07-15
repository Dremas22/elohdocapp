"use client";

import { useState, useEffect } from "react";

const mockRecords = [
  {
    id: "1",
    date: "2023-10-01",
    name: "John Doe",
    idNo: "123456",
  },
  {
    id: "2",
    date: "2023-11-15",
    name: "Jane Smith",
    idNo: "789012",
  },
];

const ViewMedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [notes, setNotes] = useState({
    general: "Loading...",
    sick: "Loading...",
    prescription: "Loading...",
  });

  useEffect(() => {
    if (selectedRecord) {
      // Simulated fetch from Firebase:
      setTimeout(() => {
        setNotes({
          general: `General Notes for ${selectedRecord.name}`,
          sick: `Sick Note for ${selectedRecord.name}`,
          prescription: `Prescription for ${selectedRecord.name}`,
        });
      }, 800);
    }
  }, [selectedRecord]);

  const filteredRecords = mockRecords.filter((record) =>
    `${record.name} ${record.idNo}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-[#333] p-8 w-full max-w-6xl mx-auto">
      

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Patient Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Patient ID No.</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => {
                    setSelectedRecord(record);
                    setActiveTab("general");
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.idNo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center px-6 py-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Overlay Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Medical Notes for {selectedRecord.name}
            </h2>

            {/* Toggle Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "general"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                General Notes
              </button>
              <button
                onClick={() => setActiveTab("sick")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "sick"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Sick Note
              </button>
              <button
                onClick={() => setActiveTab("prescription")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "prescription"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Prescription
              </button>
            </div>

            {/* Notes Content */}
            <div className="bg-gray-100 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap">
              {notes[activeTab]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMedicalRecords;
