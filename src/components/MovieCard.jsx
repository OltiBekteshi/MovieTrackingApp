import React, { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import PopUpModal from "./PopUpModal";
import { addToWatchlist, addToWatchLater } from "./../utils/movieService";
import { useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const MovieCard = ({
  watchlist,
  setWatchlist,
  watchlater,
  setWatchlater,
  userId,
}) => {
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [overviewCache, setOverviewCache] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const dropdownRef = useRef(null);

  const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 53, name: "Thriller" },
    { id: 27, name: "Horror" },
    { id: 99, name: "Documentary" },
    { id: 9648, name: "Mystery" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  const translateText = async (text, targetLang = "sq") => {
    if (!text) return "";
    if (overviewCache[text]) return overviewCache[text];

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      const data = await res.json();
      const translated = data[0].map((item) => item[0]).join("");

      setOverviewCache((prev) => ({ ...prev, [text]: translated }));
      return translated;
    } catch {
      return text;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const movieIdToOpen = params.get("open");
    if (!movieIdToOpen) return;

    openMovieDetails(movieIdToOpen);
  }, [location.search]);

  const openMovieDetails = async (movieId) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-EN`
      );
      const fullMovie = await res.json();

      // keep English overview by disabling auto-translation to Albanian
      // fullMovie.overview = await translateText(fullMovie.overview, "sq");

      setSelectedMovie(fullMovie);
    } catch {
      toast.error("Nuk mund të hapet filmi.");
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);

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

        const translatedMovies = await Promise.all(
          results.map(async (movie) => {
            // Keep movie overviews in English; disable auto-translation to Albanian
            // const translated = await translateText(movie.overview, "sq");
            // return { ...movie, overview: translated };
            return movie;
          })
        );

        setMovies(translatedMovies);
      } catch (err) {
        console.error("Error fetching movies:", err);
        toast.error("Gabim gjatë ngarkimit të filmave");
      } finally {
        setLoading(false);
      }
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
    <div className="bg-[#D3CBC0] min-h-screen p-6">
      <div className="w-full flex justify-start mb-6 mt-20">
        <div className="relative w-60 select-none" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="bg-[#293333] text-white border border-gray-300 px-4 py-3 rounded-2xl cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="font-medium">
              {genres.find((g) => g.id === Number(selectedGenre))?.name ||
                "All movies"}
            </span>
            <span className="text-sm text-white">▼</span>
          </div>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#293333] border border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div
                onClick={() => {
                  setSelectedGenre("");
                  setPage(1);
                  setOpen(false);
                }}
                className={`px-4 py-3 cursor-pointer transition-colors ${selectedGenre === "" ? "bg-[#2F4F4F] text-white font-semibold" : "text-white hover:bg-[#2f4f4f]"}`}
              >
                All movies
              </div>

              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGenre(g.id);
                    setPage(1);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors ${selectedGenre === g.id ? "bg-[#2F4F4F] text-white font-semibold" : "text-white hover:bg-[#2f4f4f]"}`}
                >
                  {g.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-black mb-6">Movies</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search for a movie..."
          className="w-full max-w-md px-4 py-2 rounded-lg bg-white text-black border-2 border-black"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Toaster position="top-right" />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ClipLoader size={79} color="white" />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#293333] rounded-2xl text-white shadow-md transition"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                className="w-full h-72 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">
                  {movie.title}
                </h3>
                <p className="truncate">{movie.overview}</p>
                <p className="text-sm mt-1">{movie.release_date}</p>
                <p className="text-white text-sm mt-1 font-bold">
                  Runtime:{" "}
                  {movieDetails[movie.id]
                    ? `${Math.floor(movieDetails[movie.id] / 60)}h ${
                        movieDetails[movie.id] % 60
                      }m`
                    : "N/A"}
                </p>
                <p className="text-yellow-400 font-bold mt-1">
                  ⭐ {movie.vote_average.toFixed(1)}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openMovieDetails(movie.id);
                  }}
                  className="bg-white text-black p-2 w-full mt-3 rounded-lg hover:scale-103 hover:opacity-[0.8] cursor-pointer"
                >
                  See details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6 gap-4">
        <button
          className="bg-[#293333] hover:bg-[#1F2626] text-white px-6 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span className="text-bg-[#293333] text-lg">Page {page}</span>

        <button
          className="bg-[#293333] hover:bg-[#1F2626] text-white px-6 py-2 rounded-lg cursor-pointer"
          onClick={() => setPage(page + 1)}
        >
          Next
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
