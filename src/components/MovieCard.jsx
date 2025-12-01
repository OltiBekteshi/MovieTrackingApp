import React, { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import PopUpModal from "./PopUpModal";
import { addToWatchlist, addToWatchLater } from "./../utils/movieService";
import { useLocation } from "react-router-dom";

const MovieCard = ({ watchlist, setWatchlist, watchlater, setWatchlater, userId }) => {
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [overviewCache, setOverviewCache] = useState({});
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const dropdownRef = useRef(null); // <-- REF për dropdown

  const genres = [
    { id: 28, name: "Aksion" },
    { id: 35, name: "Komedi" },
    { id: 53, name: "Thriller" },
    { id: 27, name: "Horror" },
    { id: 99, name: "Dokumentar" },
    { id: 9648, name: "Mister" },
  ];

  // CLICK OUTSIDE -> Mbyll dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const translateText = async (text, targetLang = "sq") => {
    if (!text) return "";
    if (overviewCache[text]) return overviewCache[text];

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      const translated = data[0].map((item) => item[0]).join("");

      setOverviewCache((prev) => ({ ...prev, [text]: translated }));
      return translated;
    } catch {
      return text;
    }
  };

  // AUT0 OPEN MOVIE FROM URL PARAM
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const movieIdToOpen = params.get("open");

  if (!movieIdToOpen) return;

  const loadMovie = async () => {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieIdToOpen}?api_key=${apiKey}&language=en-EN`
    );
    const data = await res.json();
    data.overview = await translateText(data.overview, "sq");
    setSelectedMovie(data);
  };

  loadMovie();
}, [location.search]);


  // FETCH MOVIES
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let url = "";

        if (searchTerm.trim()) {
          url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-EN&query=${encodeURIComponent(
            searchTerm
          )}&page=${page}`;
        } else if (selectedGenre !== "") {
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-EN&page=${page}&with_genres=${selectedGenre}`;
        } else {
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-EN&page=${page}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        const results = (data.results || []).filter((m) => m.poster_path);

        // FETCH RUNTIME DETAILS
        const details = {};
        await Promise.all(
          results.map(async (movie) => {
            try {
              const r = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-EN`
              );
              const d = await r.json();
              details[movie.id] = d.runtime || 0;
            } catch {
              details[movie.id] = 0;
            }
          })
        );

        setMovieDetails(details);

        // TRANSLATE EACH MOVIE OVERVIEW
        const translatedMovies = await Promise.all(
          results.map(async (movie) => {
            const translated = await translateText(movie.overview, "sq");
            return { ...movie, overview: translated };
          })
        );

        setMovies(translatedMovies);
      } catch {""}
    };

    fetchMovies();
  }, [page, searchTerm, selectedGenre]);

  const handleWatchTrailer = async (movieId) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-EN`
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (vid) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) setTrailerKey(trailer.key);
      else toast("Nuk ka trailer për këtë film!");
    } catch {
      toast.error("Gabim gjatë kërkimit të trailerit");
    }
  };

  const handleAddToWatchlist = async (movie) => {
    if (!watchlist.find((m) => m.movie_id === movie.id)) {
      try {
        await addToWatchlist(userId, movie, movieDetails[movie.id]);
        setWatchlist([
          ...watchlist,
          { ...movie, movie_id: movie.id, runtime: movieDetails[movie.id] },
        ]);
        toast.success(`${movie.title} u shtua në listën e shikuar!`);
      } catch {
        toast.error("Kyqu për të shtuar filmin");
      }
    } else {
      toast(`${movie.title} është veç në listë`);
    }
  };

  const handleAddToWatchLater = async (movie) => {
    if (!watchlater.find((m) => m.movie_id === movie.id)) {
      try {
        await addToWatchLater(userId, movie, movieDetails[movie.id]);
        setWatchlater([
          ...watchlater,
          { ...movie, movie_id: movie.id, runtime: movieDetails[movie.id] },
        ]);
        toast.success(`${movie.title} u shtua në Shiko më vonë!`);
      } catch {
        toast.error("Kyqu për të shtuar filmin");
      }
    } else {
      toast(`${movie.title} është veç në Shiko më vonë`);
    }
  };

  return (
    <div className="bg-linear-to-r from-blue-500 to-green-900 min-h-screen p-6">

      {/* DROPDOWN GENRES */}
      <div className="w-full flex justify-start mb-6 mt-20">
        <div className="relative w-60 select-none" ref={dropdownRef}>
          
          {/* Trigger */}
          <div
            onClick={() => setOpen(!open)}
            className="
              bg-white/10 text-white
              px-5 py-3
              rounded-2xl shadow-xl
              backdrop-blur-lg border border-white/30
              cursor-pointer font-semibold
              flex items-center justify-between
              transition-all duration-300
              hover:bg-white/20 hover:shadow-2xl
            "
          >
            <span>
              {genres.find(g => g.id === Number(selectedGenre))?.name || "Të gjithë filmat"}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown List */}
          {open && (
            <div
              className="
                absolute top-full left-0 right-0 mt-2
                bg-black/60 backdrop-blur-xl
                border border-white/20
                rounded-2xl shadow-2xl
                overflow-hidden z-50
              "
            >
              <div
                onClick={() => {
                  setSelectedGenre("");
                  setPage(1);
                  setOpen(false);
                }}
                className="
                  px-5 py-3 cursor-pointer
                  hover:bg-white/20 text-white font-semibold
                  transition-all duration-200
                "
              >
                Të gjithë filmat
              </div>

              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGenre(g.id);
                    setPage(1);
                    setOpen(false);
                  }}
                  className="
                    px-5 py-3 cursor-pointer
                    hover:bg-white/20 text-white font-semibold
                    transition-all duration-200
                  "
                >
                  {g.name}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* SEARCH */}
      <h1 className="text-3xl font-bold text-center text-white mb-6">Filmat</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Kërko filmin..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 bg-black/40 text-white"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Toaster position="top-right" />

      {/* MOVIE GRID */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-black rounded-2xl text-white shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
            onClick={() => setSelectedMovie(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
              <p className="truncate">{movie.overview}</p>
              <p className="text-sm mt-1">{movie.release_date}</p>
              <p className="text-white text-sm mt-1 font-bold">
                Kohezgjatja:{" "}
                {movieDetails[movie.id]
                  ? `${Math.floor(movieDetails[movie.id] / 60)}h ${movieDetails[movie.id] % 60}m`
                  : "N/A"}
              </p>
              <p className="text-yellow-400 font-bold mt-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </p>
              <button className="bg-gray-800 p-2 w-full mt-3 rounded-lg hover:bg-gray-900">
                Shiko Detajet
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          className="bg-gray-800 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-900"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Pas
        </button>

        <span className="text-white text-lg">Faqja {page}</span>

        <button
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900"
          onClick={() => setPage(page + 1)}
        >
          Para
        </button>
      </div>

      <PopUpModal
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        trailerKey={trailerKey}
        setTrailerKey={setTrailerKey}
        handleAddToWatchlist={handleAddToWatchlist}
        handleAddToWatchLater={handleAddToWatchLater}
        handleWatchTrailer={handleWatchTrailer}
        apiKey={apiKey}
      />
    </div>
  );
};

export default MovieCard;
