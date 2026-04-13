import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { supabase } from "./utils/supabaseClient";
import { getWatchlist, getWatchLater } from "./utils/movieService";

// Protected Route Wrapper
const ProtectedRoute = ({ children, isLoaded, isSignedIn }) => {
  if (!isLoaded) return null;
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
};

function App() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const userId = user?.id;
  const [isFreshTabLoad, setIsFreshTabLoad] = useState(null);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [watchlater, setWatchlater] = useState([]);

  useEffect(() => {
    const tabKey = "movie-tracker-tab-open";
    const wasOpenInThisTab = sessionStorage.getItem(tabKey) === "1";
    sessionStorage.setItem(tabKey, "1");
    setIsFreshTabLoad(!wasOpenInThisTab);
  }, []);

  useEffect(() => {
    if (!isLoaded || isFreshTabLoad === null || initialAuthChecked) return;
    if (isFreshTabLoad && isSignedIn) {
      signOut({ redirectUrl: "/sign-in" });
    }
    setInitialAuthChecked(true);
  }, [isLoaded, isFreshTabLoad, isSignedIn, signOut, initialAuthChecked]);

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
        <Navbar />
        <Routes>
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
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
