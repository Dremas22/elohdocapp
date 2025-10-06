"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#00b4d8] p-6 relative z-50">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo on the left that redirects to landing page */}
        <div className="flex items-center">
          <Link href="/" passHref>
            <img
              src="/images/elohdoc.png"
              alt="Eloh Logo"
              className="h-10 sm:h-10 w-auto object-contain px-3 pl-4 sm:pl-8 cursor-pointer transform scale-400 sm:scale-600"
            />
          </Link>
        </div>


        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-6">
          <li>
            <Link
              href="/about"
              className="text-black text-xl font-semibold hover:text-white transition"
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/ourTeam"
              className="text-black text-xl font-semibold hover:text-white transition"
            >
              Our Team
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-black text-xl font-semibold hover:text-white transition"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/forCompanies"
              className="text-black text-xl font-semibold hover:text-white transition"
            >
              For Companies
            </Link>
          </li>


        </ul>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-white bg-[#03045e] py-4 px-4 text-lg md:text-xl font-semibold rounded-xl shadow-[0_4px_#999] active:shadow-[0_2px_#666] active:translate-y-1 hover:bg-[#023e8a] transition-all duration-200 ease-in-out flex items-center justify-center gap-3 cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <FiX size={15} /> : <FiMenu size={15} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-[#00b4d8] absolute top-full left-0 w-full shadow-md ${isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <ul className="flex flex-col items-center gap-4 py-4">
          <li>
            <Link
              href="/about"
              className="text-black text-lg font-semibold hover:text-white transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About Elohdoc
            </Link>
          </li>
          <li>
            <Link
              href="/ourTeam"
              className="text-black text-lg font-semibold hover:text-white transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Team
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-black text-lg font-semibold hover:text-white transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/forCompanies"
              className="text-black text-lg font-semibold hover:text-white transition"
              onClick={() => setIsMenuOpen(false)}
            >
              For Companies
            </Link>
          </li>

        </ul>
      </div>
    </nav >
  );
};

export default Navbar;
