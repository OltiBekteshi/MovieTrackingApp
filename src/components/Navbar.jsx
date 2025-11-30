import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from("recommendations")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
    };

    loadNotifications();
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-linear-to-r from-blue-500 to-green-900 shadow-md">
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
          <Link to="/movies" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">
            Filmat
          </Link>
          <Link to="/watchlist" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">
            Lista e filmave të shikuar
          </Link>
          <Link
            to="/watch-later"
            className="px-3 py-2 rounded-2xl hover:opacity-[0.7]"
          >
            Shiko më vonë
          </Link>

          {/* NOTIFICATIONS */}
          {user && (
            <div className="relative">
              <FiBell
                size={24}
                className="cursor-pointer"
                onClick={() => setShowNotif(!showNotif)}
              />

              {showNotif && (
                <div className="absolute right-0 mt-3 bg-white text-black w-72 rounded-xl shadow-xl p-3">
                  <h3 className="font-bold mb-2">Rekomandimet</h3>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nuk keni rekomandime.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-gray-200 p-2 rounded-lg mb-2 text-sm"
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

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
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
