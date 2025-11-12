import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { SignIn, SignUp } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MovieCard from "./components/MovieCard";
import Watchlist from "./pages/Watchlist";
import WatchLater from "./pages/WatchLater";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlater, setWatchlater] = useState([]);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Home watchlist={watchlist} setWatchlist={setWatchlist} />}
          />
          <Route
            path="/movies"
            element={
              <MovieCard
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                watchlater={watchlater}
                setWatchlater={setWatchlater}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <Watchlist watchlist={watchlist} setWatchlist={setWatchlist} />
            }
          />
          <Route
            path="/watch-later"
            element={
              <WatchLater
                watchlater={watchlater}
                setWatchlater={setWatchlater}
              />
            }
          />
          <Route
            path="/sign-in"
            element={<SignInPage routing="path" path="/sign-in" />}
          />
          <Route
            path="/sign-up"
            element={<SignUpPage routing="path" path="/sign-up" />}
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
