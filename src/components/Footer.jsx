import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-[#C5C6C7] py-6  border-t border-[#45A29E]/20">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} MovieTracker. All rights reserved.
        </p>

        <div className="flex gap-4">
          <a
            href="#"
            className="hover:text-[#66FCF1] transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-[#66FCF1] transition-colors duration-200"
          >
            Terms
          </a>
          <a
            href="#"
            className="hover:text-[#66FCF1] transition-colors duration-200"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
