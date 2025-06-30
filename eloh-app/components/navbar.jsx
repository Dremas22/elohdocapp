"use client";

import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-[#00b4d8] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="rounded-full overflow-hidden border-4 border-white ml-5">
            <img src="/images/elohdoc.jpg" alt="Eloh Logo" className="h-16 w-16" />
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
}

export default Navbar;