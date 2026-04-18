import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MovieCard from "./components/MovieCard";
import Watchlist from "./pages/Watchlist";
import WatchLater from "./pages/WatchLater";
import AddFriends from "./pages/AddFriends";
import Friends from "./pages/Friends";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Page from "./pages/Page";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabase } from "./utils/supabaseClient";
import { getWatchlist, getWatchLater } from "./utils/movieService";

const isAuthRoute = (pathname) =>
  pathname === "/sign-up" || pathname.startsWith("/sign-in");
const isProtectedPath = (pathname) =>
  pathname === "/add-friends" || pathname === "/friends";

// Protected Route Wrapper
const ProtectedRoute = ({ children, isLoaded, isSignedIn }) => {
  const location = useLocation();

  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ backgroundLocation: location }}
      />
    );
  }
  return children;
};

const AppContent = ({
  watchlist,
  setWatchlist,
  watchlater,
  setWatchlater,
  userId,
  isLoaded,
  isSignedIn,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalOpen = isAuthRoute(location.pathname);
  const backgroundLocation = location.state?.backgroundLocation;
  const [persistentBackgroundLocation, setPersistentBackgroundLocation] =
    useState(null);

  useEffect(() => {
    if (modalOpen && backgroundLocation) {
      setPersistentBackgroundLocation(backgroundLocation);
      return;
    }
    if (!modalOpen) {
      setPersistentBackgroundLocation(null);
    }
  }, [modalOpen, backgroundLocation]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  const candidateBackgroundLocation =
    backgroundLocation || persistentBackgroundLocation;
  const safeBackgroundLocation =
    candidateBackgroundLocation &&
    (!isProtectedPath(candidateBackgroundLocation.pathname) || isSignedIn)
      ? candidateBackgroundLocation
      : null;

  const fallbackBackgroundLocation = modalOpen
    ? { ...location, pathname: "/movies", search: "", hash: "" }
    : null;

  const routesLocation = safeBackgroundLocation || fallbackBackgroundLocation || location;

  const closeAuthModal = () => {
    const targetPath = safeBackgroundLocation
      ? `${safeBackgroundLocation.pathname}${safeBackgroundLocation.search || ""}${
          safeBackgroundLocation.hash || ""
        }`
      : "/movies";
    navigate(targetPath, { replace: true });
  };

  return (
    <>
      <div className={modalOpen ? "pointer-events-none select-none blur-sm" : ""}>
        <Navbar />
        <Routes location={routesLocation}>
          <Route
            path="/"
            element={
              <MovieCard
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                watchlater={watchlater}
                setWatchlater={setWatchlater}
                userId={userId}
              />
            }
          />

          <Route
            path="/movies"
            element={
              <MovieCard
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                watchlater={watchlater}
                setWatchlater={setWatchlater}
                userId={userId}
              />
            }
          />

          <Route
            path="/recommended/:movieId"
            element={
              <MovieCard
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                watchlater={watchlater}
                setWatchlater={setWatchlater}
                userId={userId}
                openFromNotification={true}
              />
            }
          />

          <Route
            path="/watchlist"
            element={
              <Watchlist
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                userId={userId}
              />
            }
          />

          <Route
            path="/watch-later"
            element={
              <WatchLater
                watchlater={watchlater}
                setWatchlater={setWatchlater}
                userId={userId}
              />
            }
          />

          <Route
            path="/add-friends"
            element={
              <ProtectedRoute isLoaded={isLoaded} isSignedIn={isSignedIn}>
                <AddFriends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute isLoaded={isLoaded} isSignedIn={isSignedIn}>
                <Friends />
              </ProtectedRoute>
            }
          />

          <Route path="/todos" element={<Page />} />
        </Routes>
        <Footer />
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-md"
          onClick={closeAuthModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#243030]/95 p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-3 right-3 rounded-md px-2 py-1 text-xl text-gray-300 hover:bg-white/10 hover:text-white"
              aria-label="Close authentication modal"
            >
              &times;
            </button>
            {location.pathname.startsWith("/sign-in") ? (
              <SignInPage />
            ) : (
              <SignUpPage />
            )}
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const userId = user?.id;

  const [watchlist, setWatchlist] = useState([]);
  const [watchlater, setWatchlater] = useState([]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const keysToDelete = [];
    url.searchParams.forEach((_, key) => {
      if (key.startsWith("__clerk") || key === "__session") {
        keysToDelete.push(key);
      }
    });
    if (keysToDelete.length === 0) return;
    keysToDelete.forEach((key) => url.searchParams.delete(key));
    const query = url.searchParams.toString();
    const cleanUrl = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
    window.history.replaceState({}, "", cleanUrl);
  }, []);

  useEffect(() => {
    if (!user) return;

    const saveUserToSupabase = async () => {
      try {
        await supabase.from("users").upsert({
          id: user.id,
          full_name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          image_url: user.imageUrl,
          clerk_user_id: user.id,
        });
      } catch (error) {
        console.error("Error saving user to database:", error);
      }
    };

    const t = setTimeout(saveUserToSupabase, 800);
    return () => clearTimeout(t);
  }, [
    user?.id,
    user?.fullName,
    user?.imageUrl,
    user?.primaryEmailAddress?.emailAddress,
  ]);

  useEffect(() => {
    if (!userId) return;

    const fetchLists = async () => {
      try {
        const [wl, wlt] = await Promise.all([
          getWatchlist(userId),
          getWatchLater(userId),
        ]);
        setWatchlist(wl);
        setWatchlater(wlt);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLists();
  }, [userId]);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppContent
          watchlist={watchlist}
          setWatchlist={setWatchlist}
          watchlater={watchlater}
          setWatchlater={setWatchlater}
          userId={userId}
          isLoaded={isLoaded}
          isSignedIn={isSignedIn}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
