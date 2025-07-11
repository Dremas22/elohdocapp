"use client";
import useCurrentUser from "@/hooks/useCurrentUser";

const Step1BasicInfo = ({ formData, setFormData, errors }) => {
  const { currentUser, loading } = useCurrentUser();

  if (loading || !currentUser) {
    return (
      <div className="col-span-full text-center py-10 text-gray-600 font-medium">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Full Name */}
      <div className="col-span-full">
        <input
          type="text"
          name="fullName"
          value={currentUser.displayName || ""}
          disabled
          placeholder="Full Name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
        />
      </div>

      {/* Email */}
      <div className="col-span-full">
        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
        />
      </div>

      {/* ID Number */}
      <div className="sm:col-span-1">
        <input
          type="text"
          name="idNumber"
          value={formData.idNumber}
          onChange={(e) =>
            setFormData({ ...formData, idNumber: e.target.value })
          }
          placeholder="ID Number"
          className={`w-full px-4 py-3 rounded-md border ${
            errors.idNumber ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900`}
        />
        {errors.idNumber && (
          <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>
        )}
      </div>

      {/* Role */}
      <div className="sm:col-span-1">
        <input
          type="text"
          value={formData.role}
          disabled
          className="w-full px-4 py-3 rounded-md border bg-gray-200 text-gray-600"
        />
      </div>
    </div>
  );
};

export default Step1BasicInfo;
