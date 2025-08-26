"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ChatProfileModal = ({ userDoc, isOpen, onClose, onSave, loading }) => {
    const [formData, setFormData] = useState({
        fullName: userDoc?.fullName || "",
        email: userDoc?.email || "",
        photoFile: null,
        photoPreview: userDoc?.photoUrl || "",
    });

    useEffect(() => {
        setFormData({
            fullName: userDoc?.fullName || "",
            email: userDoc?.email || "",
            photoFile: null,
            photoPreview: userDoc?.photoUrl || "",
        });
    }, [userDoc]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, photoFile: file, photoPreview: previewUrl }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // onSave should handle uploading the file if present
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-[#0a2342] to-[#123158] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-[#03045e] relative">
                {/* Header */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    Edit Profile
                </h2>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-full overflow-hidden border-4 border-[#b8d9dff5] shadow-inner">
                            {formData.photoPreview ? (
                                <img
                                    src={formData.photoPreview}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#90e0ef]/30 flex items-center justify-center text-[#03045e] font-semibold">
                                    Upload
                                </div>
                            )}
                        </div>

                        <label
                            className="bg-[#03045e] text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer text-sm sm:text-base"
                            title="Choose a profile picture from your device"
                        >
                            Choose Photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Name Input */}
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        title="Enter your full name"
                        className="w-full p-2 sm:p-3 rounded-xl border border-[#90e0ef] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-[#caf0f8]/10 text-white placeholder-white text-sm sm:text-base"
                    />

                    {/* Email Input */}
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        title="Enter your email address"
                        className="w-full p-2 sm:p-3 rounded-xl border border-[#90e0ef] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] bg-[#caf0f8]/10 text-white placeholder-white text-sm sm:text-base"
                    />

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            title="Cancel editing"
                            className="bg-[#03045e] text-[#c81d07] font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            title="Save changes"
                            className="bg-[#03045e] text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] transform active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out cursor-pointer text-sm sm:text-base"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ChatProfileModal;
