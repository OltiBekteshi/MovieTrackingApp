import React from "react";

const Footer = () => {
  return (
    <footer className="bg-linear-to-r from-blue-500  to-green-900 shadow-md text-[#C5C6C7] py-6  border-t  border-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center text-sm">
        <p className="text-center sm:text-left text-white font-bold">
          © {new Date().getFullYear()} MovieTracker. Të gjitha të drejtat të
          rezervuara.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
