// “use client” if you're in a Next.js app using app router / client component
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/MainNavbar";
import Footer from "./footer";

const ForCompanies = () => {
    return (

        <main className="w-full bg-white">
            <Navbar />
            {/* Hero Section */}
            <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/for-companies-hero.jpg"
                        alt="For Companies Hero"
                        fill
                        className="object-cover opacity-80"
                    />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Text over hero */}
                <div className="relative z-10 text-center px-6 md:px-0">
                    <h1 className="text-white text-3xl md:text-5xl font-bold">
                        For Companies
                    </h1>
                    <p className="mt-4 text-white text-base md:text-lg max-w-2xl mx-auto">
                        We provide telehealth solutions tailored to businesses, enabling your employees to access healthcare seamlessly.
                    </p>
                </div>
            </section>

            {/* Content Section: What We Offer */}
            <section className="py-20 px-6 md:px-0 md:w-[75%] mx-auto">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center">
                    What We Offer
                </h2>

                <div className="mt-12 flex flex-col gap-16">
                    {/* 1st item */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-full md:w-1/2 h-[250px]">
                            <Image
                                src="/images/1.jpeg"
                                alt="Corporate Telemedicine"
                                fill
                                className="object-cover rounded-lg shadow-md"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Corporate Telemedicine
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Provide your staff with virtual medical consultations, prescriptions, and follow-ups.
                            </p>
                        </div>
                    </div>

                    {/* 2nd item */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Wellness Programs
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Custom health promotion, screening and wellness campaigns for your workforce.
                            </p>
                        </div>
                        <div className="relative w-full md:w-1/2 h-[250px]">
                            <Image
                                src="/images/2.jpeg"
                                alt="Wellness Programs"
                                fill
                                className="object-cover rounded-lg shadow-md"
                            />
                        </div>

                    </div>

                    {/* 3rd item */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-full md:w-1/2 h-[250px]">
                            <Image
                                src="/images/3.jpeg"
                                alt="Analytics & Insights"
                                fill
                                className="object-cover rounded-lg shadow-md"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Analytics & Insights
                            </h3>
                            <p className="mt-2 text-gray-600">
                                Access anonymized health trends and reporting to guide your corporate health strategy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Banner */}
            <section className="bg-[#03045e] py-16 px-6 md:px-0">
                <div className="md:w-[75%] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <h3 className="text-white text-2xl md:text-3xl font-semibold text-center md:text-left">
                        Want to bring TruMD to your workplace?
                    </h3>
                    <Link
                        href="/contact"
                        className="inline-block bg-[#00b4d8] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#00a1c5] transition"
                    >
                        Get In Touch
                    </Link>
                </div>
            </section>


            <Footer />
        </main>
    );
};

export default ForCompanies;
