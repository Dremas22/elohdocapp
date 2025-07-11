"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-6">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo on the left */}
        <div className="flex items-center">
          <img
            src="/images/elohdoc.png"
            alt="Eloh Logo"
            className="h-10 sm:h-10 w-auto object-contain px-3 pl-4 sm:pl-8 cursor-pointer transform scale-400 sm:scale-600"
          />
        </div>

        {/* Links on the right */}
        <ul className="flex items-center gap-6">
          <li>
            <Link
              href="/about"
              className="text-black text-sm font-semibold hover:text-white transition"
            >
              Our Team
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-black text-sm font-semibold hover:text-white transition"
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
