"use client";

import { africanCountries, phoneCodes } from "@/constants";

const Step2ContactInfo = ({ formData, setFormData, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-md border border-blue-100">
    {/* Section Header */}
    <div className="col-span-full mb-2">
      <h2 className="text-xl font-semibold text-blue-800">
        Contact Information
      </h2>
      <p className="text-sm text-gray-500">
        Help us stay in touch by filling in your current details.
      </p>
    </div>

    {/* Country */}
    <div className="sm:col-span-1">
      <label className="block mb-1 text-sm font-medium text-blue-700">
        Country
      </label>
      <select
        name="country"
        value={formData.location.country}
        onChange={(e) =>
          setFormData({
            ...formData,
            location: { ...formData.location, country: e.target.value },
          })
        }
        className={`w-full px-4 py-3 rounded-lg border border-blue-200 ${errors.country ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
      >
        <option value="">Select Country</option>
        {africanCountries.map(({ id, title }) => (
          <option key={id} value={title}>
            {title}
          </option>
        ))}
      </select>
      {errors.country && (
        <p className="text-sm text-red-600 mt-1">{errors.country}</p>
      )}
    </div>

    {/* City */}
    <div className="sm:col-span-1">
      <label className="block mb-1 text-sm font-medium text-blue-700">
        City / Town
      </label>
      <input
        type="text"
        name="city"
        value={formData.location.city}
        onChange={(e) =>
          setFormData({
            ...formData,
            location: { ...formData.location, city: e.target.value },
          })
        }
        placeholder="City"
        className={`w-full px-4 py-3 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
      />
      {errors.city && (
        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
      )}
    </div>

    {/* Address Line */}
    <div className="col-span-full">
      <label className="block mb-1 text-sm font-medium text-blue-700">
        Address Line
      </label>
      <input
        type="text"
        name="addressLine"
        value={formData.location.addressLine}
        onChange={(e) =>
          setFormData({
            ...formData,
            location: { ...formData.location, addressLine: e.target.value },
          })
        }
        placeholder="Street name, building number..."
        className={`w-full px-4 py-3 rounded-lg border ${errors.addressLine ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
      />
      {errors.addressLine && (
        <p className="text-sm text-red-600 mt-1">{errors.addressLine}</p>
      )}
    </div>

    {/* Phone Code + Phone Number */}
    <div className="col-span-full">
      <label className="block mb-1 text-sm font-medium text-blue-700">
        Phone Number
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          name="phoneCode"
          value={formData.phoneCode}
          onChange={(e) =>
            setFormData({
              ...formData,
              phoneCode: e.target.value,
            })
          }
          className={`w-full sm:w-28 px-3 py-3 rounded-lg border ${errors.phoneCode ? "border-red-500" : "border-gray-300"
            } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
        >
          {phoneCodes.map(({ code, label }) => (
            <option key={label} value={code}>
              {code}
            </option>
          ))}
        </select>

        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({
              ...formData,
              phoneNumber: e.target.value,
            })
          }
          placeholder="Phone Number"
          className={`w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? "border-red-500" : "border-gray-300"
            } bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200`}
          pattern="^[0-9]{6,10}$"
        />
      </div>
      {errors.phoneNumber && (
        <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
      )}
    </div>
  </div>
);

export default Step2ContactInfo;
