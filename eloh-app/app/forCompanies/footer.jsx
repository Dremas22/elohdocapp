"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700">
      {/* Top Footer Section */}
      <div className="md:w-[75%] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: About */}
        <div>
          <img
            src="/images/elohdoc.png"
            alt="ElohDoc Logo"
            className="lg:scale-400 h-10 lg:pl-2 w-auto object-contain mb-2"
          />
          <p className="text-gray-600 text-sm">
            Operating under the medical practices of licensed doctors registered
            with the HPCSA. ElohDoc is authorised under multiple doctor practice
            licenses.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/forCompanies">For Companies</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Useful Links */}
        <div>
          <h4 className="font-semibold mb-4">Useful Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
            <li>
              <Link href="#">Refunds & Cancellation Policy</Link>
            </li>
            <li>
              <Link href="#">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="#">2025 Awareness Calendar</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Social */}
        <div>
          <h4 className="font-semibold mb-4">Get in Touch</h4>

          <div className="mt-4 flex space-x-4 text-gray-600">
            <Link href="https://facebook.com">
              <FaFacebookF size={20} />
            </Link>
            <Link href="https://instagram.com">
              <FaInstagram size={20} />
            </Link>
            <Link href="https://twitter.com">
              <FaTwitter size={20} />
            </Link>
            <Link href="https://tiktok.com">
              <FaTiktok size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-300">
        <div className="md:w-[75%] mx-auto px-6 py-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} ElohDoc Health Care. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
