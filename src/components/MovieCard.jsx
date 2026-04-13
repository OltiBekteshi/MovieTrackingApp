import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import PopUpModal from "./PopUpModal";
import TopMoviesThisMonth from "./TopMoviesThisMonth";
import { addToWatchlist, addToWatchLater } from "./../utils/movieService";
import { useLocation } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { useDebouncedValue } from "../utils/useDebouncedValue";
import {
  fetchMovieRuntime,
  fetchRuntimesInPools,
} from "../utils/tmdbRuntime";

const SEARCH_DEBOUNCE_MS = 400;
const RUNTIME_POOL_SIZE = 5;

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
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [overviewCache, setOverviewCache] = useState({});
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const movieDetailsRef = useRef(movieDetails);
  movieDetailsRef.current = movieDetails;

  const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 53, name: "Thriller" },
    { id: 27, name: "Horror" },
    { id: 99, name: "Documentary" },
    { id: 9648, name: "Mystery" },
  ];

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
      toast.error("Could not open movie.");
    }
  };

  const ensureRuntime = useCallback(async (movie) => {
    const cached = movieDetailsRef.current[movie.id];
    if (cached !== undefined) return cached;
    try {
      const runtime = await fetchMovieRuntime(movie.id, apiKey);
      setMovieDetails((prev) => ({ ...prev, [movie.id]: runtime }));
      return runtime;
    } catch {
      setMovieDetails((prev) => ({ ...prev, [movie.id]: 0 }));
      return 0;
    }
  }, [apiKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchMovies = async () => {
      try {
        setLoading(true);

        let url = "";

        if (debouncedSearch.trim()) {
          url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-EN&query=${encodeURIComponent(
            debouncedSearch
          )}&page=${page}`;
        } else if (selectedGenre !== "") {
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-EN&page=${page}&with_genres=${selectedGenre}`;
        } else {
          url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-EN&page=${page}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const results = (data.results || []).filter((m) => m.poster_path);

        if (cancelled) return;

        setMovies(results);
        setMovieDetails({});

        if (!apiKey || results.length === 0) {
          return;
        }

        fetchRuntimesInPools(
          results.map((m) => m.id),
          apiKey,
          RUNTIME_POOL_SIZE,
          (id, runtime) => {
            if (!cancelled) {
              setMovieDetails((prev) => ({ ...prev, [id]: runtime }));
            }
          }
        ).catch(() => {});
      } catch (err) {
        console.error("Error fetching movies:", err);
        toast.error("Failed to load movies");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMovies();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, selectedGenre, apiKey]);

  const handleWatchTrailer = async (movieId) => {
    try {
      // Ensure modal has a selected movie when trailer is opened from hero section.
      if (!selectedMovie || selectedMovie.id !== movieId) {
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-EN`
        );
        const fullMovie = await movieRes.json();
        setSelectedMovie(fullMovie);
      }

      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-EN`
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (vid) => vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) setTrailerKey(trailer.key);
      else toast("No trailer available for this movie.");
    } catch {
      toast.error("Failed to load trailer");
    }
  };

  const handleAddToWatchlist = async (movie) => {
    if (!watchlist.find((m) => m.movie_id === movie.id)) {
      try {
        const runtime = await ensureRuntime(movie);
        await addToWatchlist(userId, movie, runtime);
        setWatchlist([
          ...watchlist,
          { ...movie, movie_id: movie.id, runtime },
        ]);
        toast.success(`${movie.title} added to your watchlist!`);
      } catch {
        toast.error("Sign in to add movies");
      }
    } else {
      toast(`${movie.title} is already in your watchlist`);
    }
  };

  const handleAddToWatchLater = async (movie) => {
    if (!watchlater.find((m) => m.movie_id === movie.id)) {
      try {
        const runtime = await ensureRuntime(movie);
        await addToWatchLater(userId, movie, runtime);
        setWatchlater([
          ...watchlater,
          { ...movie, movie_id: movie.id, runtime },
        ]);
        toast.success(`${movie.title} added to Watch later!`);
      } catch {
        toast.error("Sign in to add movies");
      }
    } else {
      toast(`${movie.title} is already in Watch later`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <TopMoviesThisMonth
          apiKey={apiKey}
          onMovieClick={(movieId) => openMovieDetails(movieId)}
        />
      </div>

      <div className="border-t border-gray-200 bg-white p-6">
        <div className="mx-auto mb-10 w-full max-w-5xl">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 px-2 sm:gap-x-5 sm:px-4">
          <button
            type="button"
            onClick={() => {
              setSelectedGenre("");
              setPage(1);
            }}
            className={`rounded-full border-2 px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:cursor-pointer ${
              selectedGenre === ""
                ? "border-gray-900 bg-gray-900 text-white shadow-md"
                : "border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {genres.map((g) => {
            const isActive = Number(selectedGenre) === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGenre(g.id);
                  setPage(1);
                }}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 hover:cursor-pointer ${
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white shadow-md"
                    : "border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <input
            type="text"
            placeholder="Search for a movie..."
            className="w-full max-w-md rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <ClipLoader size={79} color="#293333" aria-label="Loading movies" />
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="rounded-2xl bg-[#293333] text-white shadow-md ring-1 ring-black/10 transition hover:shadow-lg"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  className="w-full h-72 object-cover"
                  alt={movie.title}
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

        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className="flex items-center text-lg font-medium text-gray-800">
            Page {page}
          </span>

          <button
            type="button"
            className="cursor-pointer rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
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
