import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiBell, FiUsers } from "react-icons/fi";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { supabase } from "../utils/supabaseClient";
import FriendSidebar from "./FriendSidebar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [showFriendSidebar, setShowFriendSidebar] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  const isActive = (path) => {
    if (path === "/movies" && (location.pathname === "/" || location.pathname === "/movies")) {
      return true;
    }
    return location.pathname === path;
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, 99);

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

  useEffect(() => {
    if (!user) return;

    const loadPendingRequests = async () => {
      const { data } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      setPendingFriendRequests(data || []);
    };

    loadPendingRequests();

    // Subscribe to real-time updates for friend requests
    const channel = supabase
      .channel("friend-requests-realtime")
      .on(
        "postgres_changes",
        {
          schema: "public",
          table: "friend_requests",
          event: "INSERT",
          filter: `receiver_id=eq."${user.id}"`,
        },
        (payload) => {
          if (payload.new.status === "pending") {
            setPendingFriendRequests((prev) => [payload.new, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          schema: "public",
          table: "friend_requests",
          event: "UPDATE",
        },
        (payload) => {
          setPendingFriendRequests((prev) =>
            prev.filter((r) => r.id !== payload.new.id || payload.new.status === "pending")
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const deleteNotification = async (id) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const openRecommended = (notif) => {
    setShowNotif(false);
    deleteNotification(notif.id);
    navigate(`/movies?open=${notif.movie_id}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#293333] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 text-white">
        <Link
          to="/"
          className="text-xl font-bold flex items-center hover:opacity-80"
        >
          <img src="/movie.png" alt="Logo" className="h-7 w-7 mr-1" />
          MovieTracker
        </Link>

        <div className="hidden md:flex items-center gap-5">
         
          <Link
            to="/movies"
            className={`px-3 py-2 rounded-2xl transition-colors ${
              isActive("/movies")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Movies
          </Link>
          <Link
            to="/watchlist"
            className={`px-3 py-2 rounded-2xl transition-colors ${
              isActive("/watchlist")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Watchlist
          </Link>
          <Link
            to="/watch-later"
            className={`px-3 py-2 rounded-2xl transition-colors ${
              isActive("/watch-later")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Watch Later
          </Link>

          <SignedIn>
            <button
              type="button"
              onClick={() => setShowFriendSidebar((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#3a4a4a] hover:bg-[#4e5d5d] transition-colors hover:cursor-pointer"
            >
              <FiUsers size={18} />
              Friends
              {pendingFriendRequests.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
              )}
            </button>
          </SignedIn>

          {user && (
            <div className="relative" ref={notifRef}>
              <FiBell
                size={28}
                className="cursor-pointer"
                onClick={() => setShowNotif((prev) => !prev)}
              />

              {notifications.length > 0 && (
                <span className="absolute top-0 -right-1 bg-red-600 h-2 w-2 rounded-full"></span>
              )}

              {showNotif && (
                <div className="absolute right-0 mt-3 bg-white text-black w-72 rounded-xl shadow-xl p-3 z-50">
                  <h3 className="font-bold mb-2">Notifications</h3>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      You don't have any notifications.
                    </p>
                  ) : (
                    <>
                      {displayedNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => openRecommended(n)}
                          className="bg-gray-100 shadow p-2 rounded-lg mb-2 text-sm cursor-pointer hover:bg-gray-200"
                        >
                          {n.message}
                        </div>
                      ))}

                      {notifications.length > 5 && !showAll && (
                        <button
                          onClick={() => setShowAll(true)}
                          className="text-blue-600 text-sm font-bold hover:underline"
                        >
                          More...
                        </button>
                      )}

                      {showAll && (
                        <button
                          onClick={() => setShowAll(false)}
                          className="text-blue-600 text-sm font-bold hover:underline mt-2"
                        >
                          Less...
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <SignedOut>
            <Link to="/sign-in" className="border px-4 py-2 rounded-2xl">
              Log in
            </Link>
            <Link to="/sign-up" className="border px-4 py-2 rounded-2xl">
              Sign up
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#293333] text-white px-6 py-4 space-y-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-2xl transition-colors ${
              isActive("/")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-2xl transition-colors ${
              isActive("/movies")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Movies
          </Link>
          <Link
            to="/watchlist"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-2xl transition-colors ${
              isActive("/watchlist")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Watchlist
          </Link>
          <Link
            to="/watch-later"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-2xl transition-colors ${
              isActive("/watch-later")
                ? "bg-[#3a4a4a] text-white"
                : "hover:bg-[#3a4a4a] hover:text-white"
            }`}
          >
            Watch Later
          </Link>
          
          <SignedIn>
            <button
              type="button"
              onClick={() => {
                setShowFriendSidebar((prev) => !prev);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-2xl bg-[#3a4a4a] hover:bg-[#4e5d5d] transition-colors"
            >
              Friends / Add
            </button>
          </SignedIn>

          {user && (
            <div className="relative" ref={notifRef}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowNotif((p) => !p)}
              >
                <FiBell size={24} />
                <span>Notifications</span>
              </div>

              {notifications.length > 0 && (
                <span className="absolute top-0 left-20 bg-red-600 h-2 w-2 rounded-full"></span>
              )}

              {showNotif && (
                <div className="mt-3 bg-white text-black w-full rounded-xl shadow-xl p-3 z-50">
                  <h3 className="font-bold mb-2">Notifications</h3>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      You don't have any notifications.
                    </p>
                  ) : (
                    <>
                      {displayedNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => openRecommended(n)}
                          className="bg-gray-100 shadow p-2 rounded-lg mb-2 text-sm cursor-pointer hover:bg-gray-200"
                        >
                          {n.message}
                        </div>
                      ))}

                      {notifications.length > 5 && !showAll && (
                        <button
                          onClick={() => setShowAll(true)}
                          className="text-blue-600 text-sm font-bold hover:underline"
                        >
                          Show more...
                        </button>
                      )}

                      {showAll && (
                        <button
                          onClick={() => setShowAll(false)}
                          className="text-blue-600 text-sm font-bold hover:underline mt-2"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <SignedOut>
            <Link
              to="/sign-in"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              Log in
            </Link>
            <Link
              to="/sign-up"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              Sign up
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      )}
      <FriendSidebar
        user={user}
        show={showFriendSidebar}
        onClose={() => setShowFriendSidebar(false)}
      />
    </nav>
  );
};

export default Navbar;
