import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MovieCard from "./components/MovieCard";
import Watchlist from "./pages/Watchlist";
import WatchLater from "./pages/WatchLater";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Page from "./pages/Page";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "./utils/supabaseClient";
import { getWatchlist, getWatchLater } from "./utils/movieService";

function App() {
  const { user } = useUser();
  const userId = user?.id;

  const [watchlist, setWatchlist] = useState([]);
  const [watchlater, setWatchlater] = useState([]);

  useEffect(() => {
    if (!user) return;

    const saveUserToSupabase = async () => {
      try {
        await supabase.from("users").upsert({
          id: user.id,
          full_name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          image_url: user.imageUrl,
          clerk_user_id: user.id
        });
      } catch (error) {
        console.error("Gabim gjate ruajtjes se user:", error);
      }
    };

    saveUserToSupabase();
  }, [user]);

  useEffect(() => {
    if (!userId) return;

    const fetchLists = async () => {
      try {
        const wl = await getWatchlist(userId);
        const wlt = await getWatchLater(userId);
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
          <Route path="/" element={<Home watchlist={watchlist} setWatchlist={setWatchlist} />} />

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

          {/* NEW ROUTE TO OPEN MOVIE FROM NOTIFICATION */}
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
