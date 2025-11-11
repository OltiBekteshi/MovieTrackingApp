import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import PopUpModal from "./PopUpModal";

const MovieCard = ({ watchlist, setWatchlist, watchlater, setWatchlater }) => {
  const [movies, setMovies] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`
      );
      const data = await res.json();
      setMovies(data.results);

      const details = {};
      await Promise.all(
        data.results.map(async (movie) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`
          );
          const movieData = await res.json();
          details[movie.id] = movieData.runtime;
        })
      );
      setMovieDetails(details);
    };
    fetchMovies();
  }, [apiKey, page]);

  const handleWatchTrailer = async (movieId) => {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`
    );
    const data = await res.json();
    const trailer = data.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer"
    );
    if (trailer) setTrailerKey(trailer.key);
    else toast("No trailer available for this movie");
  };

  const handleAddToWatchlist = (movie) => {
    if (!watchlist.find((m) => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
      toast.success(`${movie.title} added to your watchlist!`);
    } else {
      toast(`${movie.title} is already in your watchlist.`);
    }
    navigate("/watchlist");
  };

  const handleAddToWatchLater = (movie) => {
    if (!watchlater.find((m) => m.id === movie.id)) {
      setWatchlater([...watchlater, movie]);
      toast.success(`${movie.title} added to Watch Later!`);
    } else {
      toast(`${movie.title} is already in your Watch Later list.`);
    }
    navigate("/watch-later");
  };

  return (
    <div className="bg-black min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-white mt-20">
        Movies
      </h1>
      <Toaster position="top-right" />
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="bg-red-900 text-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
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
                Duration:{" "}
                {movieDetails[movie.id]
                  ? `${Math.floor(movieDetails[movie.id] / 60)}h ${
                      movieDetails[movie.id] % 60
                    }m`
                  : "N/A"}
              </p>

              <p className="text-yellow-500 font-bold mt-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </p>
              <div>
                <button className="bg-gray-800 p-3 text-white font-bold mt-2 rounded-xl hover:shadow-xl hover:cursor-pointer w-full">
                  See details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="text-white px-2 py-2">{page}</span>
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
          onClick={() => setPage((prev) => prev + 1)}
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
