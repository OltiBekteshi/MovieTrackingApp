import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
    };

    load();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          schema: "public",
          table: "notifications",
          event: "INSERT",
          filter: `receiver_id=eq."${user.id}"`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);


  const openRecommended = (movieId) => {
    setShowNotif(false);
    navigate(`/movies?open=${movieId}`);
  };


  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-linear-to-r from-blue-500 to-green-900 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 text-white">
        <Link to="/" className="text-xl font-bold hover:opacity-80 flex items-center">
          <img src="/movie.png" alt="Logo" className="h-7 w-7 mr-1" />
          MovieTracker
        </Link>

        <div className="hidden md:flex items-center gap-5">

          <Link to="/" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">Ballina</Link>
          <Link to="/movies" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">Filmat</Link>
          <Link to="/watchlist" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">Të shikuar</Link>
          <Link to="/watch-later" className="px-3 py-2 rounded-2xl hover:opacity-[0.7]">Shiko më vonë</Link>

          {user && (
            <div className="relative">
              <FiBell
                size={28}
                className="cursor-pointer"
                onClick={() => setShowNotif(!showNotif)}
              />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}

              {showNotif && (
                <div className="absolute right-0 mt-3 bg-white text-black w-72 rounded-xl shadow-xl p-3 z-50">
                  <h3 className="font-bold mb-2">Rekomandimet</h3>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">Nuk keni rekomandime.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => openRecommended(n.movie_id)}
                        className="bg-green-600 p-2 rounded-lg mb-2 text-sm font-bold text-white cursor-pointer hover:bg-green-700"
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
            <Link to="/sign-in" className="border px-4 py-2 rounded-2xl">Kyqu</Link>
            <Link to="/sign-up" className="border px-4 py-2 rounded-2xl">Krijo llogari</Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
