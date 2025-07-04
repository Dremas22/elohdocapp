"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-4">
      <div className="container mx-auto flex justify-between items-center flex-wrap">

        {/* Logo */}
        <div className="flex-shrink-0 flex justify-center sm:justify-start mb-2 sm:mb-0">
          <img
            src="/images/elohdoc.png"
            alt="Eloh Logo"
            className="h-8 sm:h-10 w-auto object-contain px-5 cursor-pointer"
          />
        </div>

        {/* Links */}
        <ul className="flex flex-row justify-center items-center gap-4 sm:gap-8 w-full sm:w-auto">
          <li>
            <Link
              href="/about"
              className="text-black text-xs sm:text-sm font-semibold hover:text-white transition"
            >
              Our Team
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-black text-xs sm:text-sm font-semibold hover:text-white transition"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
