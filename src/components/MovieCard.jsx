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
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

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

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddToWatchlist = async (movie) => {
    if (!watchlist.find((m) => m.movie_id === movie.id)) {
      try {
        await addToWatchlist(userId, movie);
        setWatchlist([...watchlist, { ...movie, movie_id: movie.id }]);
        toast.success(`${movie.title} u shtua në listën e filmave të shikuar!`);
      } catch (err) {
        toast.error("Shtimi i filmit dështoi");
        console.error(err);
      }
    } else {
      toast(`${movie.title} gjindet në listën e filmave të shikuar`);
    }
  };

  const handleAddToWatchLater = async (movie) => {
    if (!watchlater.find((m) => m.movie_id === movie.id)) {
      try {
        await addToWatchLater(userId, movie);
        setWatchlater([...watchlater, { ...movie, movie_id: movie.id }]);
        toast.success(`${movie.title} u shtua në Shiko më vonë!`);
      } catch (err) {
        toast.error("Shtimi i filmit dështoi");
        console.error(err);
      }
    } else {
      toast(`${movie.title} gjindet në listën e Shiko më vonë`);
    }
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
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Toaster position="top-right" />

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredMovies.map((movie) => (
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

      <div className="flex justify-center mt-6 gap-4">
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Pas
        </button>
        <span className="text-white px-2 py-2">{page}</span>
        <button
          className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
          onClick={() => setPage((prev) => prev + 1)}
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
