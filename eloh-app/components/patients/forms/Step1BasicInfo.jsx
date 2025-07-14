"use client";
import useCurrentUser from "@/hooks/useCurrentUser";

const Step1BasicInfo = ({ formData, setFormData, errors }) => {
  const { currentUser, loading } = useCurrentUser();

  if (loading || !currentUser) {
    return (
      <div className="col-span-full text-center py-10 text-gray-500 font-medium">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      {/* Section Title */}
      <div className="col-span-full mb-2">
        <h2 className="text-xl font-semibold text-blue-800">
          Patient Basic Information
        </h2>
        <p className="text-sm text-gray-500">
          Please fill in your personal details.
        </p>
      </div>

      {/* Full Name */}
      <div className="col-span-full">
        <label className="block mb-1 text-sm font-medium text-blue-700">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={currentUser.displayName || ""}
          disabled
          placeholder="Full Name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 focus:outline-none"
        />
      </div>

      {/* Email */}
      <div className="col-span-full">
        <label className="block mb-1 text-sm font-medium text-blue-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 focus:outline-none"
        />
      </div>

      {/* ID Number */}
      <div className="sm:col-span-1">
        <label className="block mb-1 text-sm font-medium text-blue-700">
          ID Number
        </label>
        <input
          type="text"
          name="idNumber"
          value={formData.idNumber}
          onChange={(e) =>
            setFormData({ ...formData, idNumber: e.target.value })
          }
          placeholder="ID Number"
          className={`w-full px-4 py-3 rounded-lg border ${errors.idNumber ? "border-red-500" : "border-gray-300"
            } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
        />
        {errors.idNumber && (
          <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>
        )}
      </div>

      {/* Role */}
      <div className="sm:col-span-1">
        <label className="block mb-1 text-sm font-medium text-blue-700">
          Role
        </label>
        <input
          type="text"
          value={formData.role}
          disabled
          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;
