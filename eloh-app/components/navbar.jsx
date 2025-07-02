"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="ml-4">
          {/* 
            Used ml to add left margin to move the logo right
            Wrapped logo in a Link to navigate to the landing page (/)
          */}
          <Link href="/">
            <img
              src="/images/elohdoc.png"
              alt="Eloh Logo"
              className="h-15 w-15 object-cover transform scale-[3.5] cursor-pointer"
            />
          </Link>
        </div>
        <ul className="flex space-x-8 mr-7">
          <li>
            <a href="/about" className="text-black font-bold hover:text-white">
              Our Team
            </a>
          </li>
          <li>
            <a href="/contact" className="text-black font-bold hover:text-white">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
