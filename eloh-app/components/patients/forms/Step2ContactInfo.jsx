"use client";

import { africanCountries, phoneCodes } from "@/constants";

const Step2ContactInfo = ({ formData, setFormData, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <div className="sm:col-span-1">
      <select
        name="country"
        value={formData.location.country}
        onChange={(e) =>
          setFormData({
            ...formData,
            location: { ...formData.location, country: e.target.value },
          })
        }
        className={`w-full px-4 py-3 rounded-md border ${
          errors.country ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
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

    <div className="sm:col-span-1">
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
        className={`w-full px-4 py-3 rounded-md border ${
          errors.city ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      {errors.city && (
        <p className="text-sm text-red-600 mt-1">{errors.city}</p>
      )}
    </div>

    <div className="col-span-full">
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
        placeholder="Address"
        className={`w-full px-4 py-3 rounded-md border ${
          errors.addressLine ? "border-red-500" : "border-gray-300"
        } bg-white text-gray-900`}
      />
      {errors.addressLine && (
        <p className="text-sm text-red-600 mt-1">{errors.addressLine}</p>
      )}
    </div>

    <div className="col-span-full">
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
          className={`w-full sm:w-24 px-3 py-3 rounded-lg border ${
            errors.phoneCode ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
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
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.phoneNumber ? "border-red-500" : "border-gray-300"
          } bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500`}
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
