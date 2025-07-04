"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center">

        <div className="w-full sm:w-auto flex justify-center sm:justify-start mb-2 sm:mb-0">

          <img
            src="/images/elohdoc.png"
            alt="Eloh Logo"
            className="h-10 w-auto object-contain px-5 cursor-pointer transform scale-350"
          />

        </div>

        <ul className="w-full sm:w-auto flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2 sm:gap-8 mt-2 sm:mt-0">
          <li>
            <Link
              href="/about"
              className="text-black text-sm sm:text-base font-semibold hover:text-white transition"
            >
              Our Team
            </Link>

          </li>
          <li>
            <Link
              href="/contact"
              className="text-black text-sm sm:text-base font-semibold hover:text-white transition"
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
