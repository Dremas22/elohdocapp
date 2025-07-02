"use client";

import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className>
          <img src="/images/elohdoc.png" alt="Eloh Logo" className="h-15 w-15 object-cover transform scale-350" />
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
