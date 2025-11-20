import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-linear-to-r from-blue-500  to-green-900 shadow-md ">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 text-white">
        <Link
          to="/"
          className="text-xl font-bold hover:opacity-80 flex items-center"
        >
          <img src="/movie.png" alt="Movie Logo" className="h-7 w-7 mr-1" />
          MovieTracker
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <Link to="/" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">
            Ballina
          </Link>
          <Link
            to="/movies"
            className="px-3 py-2 rounded-2xl hover:opacity-[0.7]"
          >
            Filmat
          </Link>
          <Link
            to="/watchlist"
            className="px-3 py-2 rounded-2xl hover:opacity-[0.7]"
          >
            Lista e filmave të shikuar
          </Link>
          <Link
            to="/watch-later"
            className="px-3 py-2 rounded-2xl hover:opacity-[0.7]"
          >
            Shiko më vonë
          </Link>

          <SignedOut>
            <Link
              to="/sign-in"
              className="border text-white px-4 py-2 rounded-2xl hover:opacity-[0.7]"
            >
              Kyqu
            </Link>
            <Link
              to="/sign-up"
              className="border px-4 py-2 rounded-2xl hover:opacity-[0.7]"
            >
              Krijo llogari
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              localization={{
                signIn: {
                  start: {
                    title: "Hyrje",
                    subtitle: "Përdorni llogarinë tuaj për të vazhduar",
                    actionText: "Hyr",
                    footerText: "Nuk keni llogari? Regjistrohuni!",
                  },
                },
              }}
            />
          </SignedIn>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-2xl focus:outline-none"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-md">
          <Link
            to="/"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Ballina
          </Link>
          <Link
            to="/movies"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Filmat
          </Link>
          <Link
            to="/watchlist"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Lista e filmave të shikuara
          </Link>
          <Link
            to="/watch-later"
            className="block px-4 py-3 hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Shiko më vonë
          </Link>

          <SignedOut>
            <Link
              to="/sign-in"
              className="block px-4 py-3 bg-black text-white rounded-lg m-2 text-center hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              Kyqu
            </Link>
            <Link
              to="/sign-up"
              className="block px-4 py-3 border border-black rounded-lg m-2 text-center hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Krijo llogarinë
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex justify-center py-3">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
