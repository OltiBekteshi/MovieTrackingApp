import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieCard from './components/MovieCard';
import Watchlist from './pages/Watchlist';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [watchlist, setWatchlist] = useState([]); 

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Home watchlist={watchlist} setWatchlist={setWatchlist} />}
        />
        <Route
          path="/movies"
          element={<MovieCard watchlist={watchlist} setWatchlist={setWatchlist} />}
        />
        <Route
          path="/watchlist"
          element={<Watchlist watchlist={watchlist} setWatchlist={setWatchlist} />}
        />
        <Route path="/log-in" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
