import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import PopUpModal from "./PopUpModal";
import { addToWatchlist, addToWatchLater } from "./../utils/movieService";

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
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [overviewCache, setOverviewCache] = useState({}); 

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

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
    } catch (err) {
      console.error("Translation error:", err);
      return text; 
    }
  };

  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const isSearching = searchTerm.trim().length > 0;

        const url = isSearching
          ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-EN&query=${encodeURIComponent(
              searchTerm
            )}&page=${page}&include_adult=false`
          : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-EN&page=${page}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies");

        const data = await res.json();
        const results = data.results || [];
        const resultsWithPosters = results.filter((movie) => movie.poster_path);

        const details = {};
        await Promise.all(
          resultsWithPosters.map(async (movie) => {
            try {
              const res = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-EN`
              );
              const movieData = await res.json();
              details[movie.id] = movieData.runtime || 0;
            } catch {
              details[movie.id] = 0;
            }
          })
        );
        setMovieDetails(details);

        const translatedMovies = await Promise.all(
          resultsWithPosters.map(async (movie) => {
            const translatedOverview = await translateText(movie.overview, "sq");
            return { ...movie, overview: translatedOverview };
          })
        );

        setMovies(translatedMovies);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error(error);
        toast.error("Nuk mund t'i marr filmat");
        setMovies([]);
      }
    };

    fetchMovies();
  }, [apiKey, page, searchTerm]);

  
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
      else toast("No trailer available for this movie");
    } catch (err) {
      console.error(err);
      toast.error("Nuk mund ta gjej trailerin");
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
        toast.success(`${movie.title} u shtua në listën e filmave të shikuar!`);
      } catch  {
        toast.error("Kyqu per te shtuar filmin");
      }
    } else {
      toast(`${movie.title} gjindet në listën e filmave të shikuar`);
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
        toast.error("Kyqu per te shtuar filmin");
      }
    } else {
      toast(`${movie.title} gjindet në listën e Shiko më vonë`);
    }
  };

  const handleNextPage = () => {
    setPage((prev) => (prev >= totalPages ? 1 : prev + 1));
  };

  const handlePrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  
  return (
    <div className="bg-linear-to-r from-blue-500 to-green-900 shadow-md min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-white mt-20">
        Filmat
      </h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Kerko filmin..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 text-white bg-black/40"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <Toaster position="top-right" />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="bg-black text-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-72 object-cover overflow-hidden"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
              <p className="truncate">{movie.overview}</p> 
              <p className="text-sm text-white">{movie.release_date}</p>

              <p className="text-sm text-white mt-1 font-bold">
                Kohezgjatja:{" "}
                {movieDetails[movie.id]
                  ? `${Math.floor(movieDetails[movie.id] / 60)}h ${
                      movieDetails[movie.id] % 60
                    }m`
                  : "N/A"}
              </p>

              <p className="text-yellow-500 font-bold mt-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </p>

              <button className="bg-gray-800 p-3 text-white font-bold mt-2 rounded-xl hover:shadow-xl w-full hover:cursor-pointer">
                Shiko detajet
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-4 items-center">
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer disabled:opacity-50"
          disabled={page === 1}
          onClick={handlePrevPage}
        >
          Pas
        </button>

        <span className="text-white px-2 py-2">Faqja {page} </span>

        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
          onClick={handleNextPage}
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
