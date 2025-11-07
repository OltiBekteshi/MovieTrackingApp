import React, { useEffect, useState } from "react";


const MovieCard = ({ watchlist, setWatchlist }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  
  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`
      );
      const data = await res.json();
      setMovies(data.results);
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
    else alert("No trailer available for this movie 😞");
  };

  
  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
      setSelectedMovie(null);
      setTrailerKey(null);
    }
  };

  
  const handleAddToWatchlist = (movie) => {
    if (!watchlist.find((m) => m.id === movie.id)) {
      setWatchlist([...watchlist, movie]);
      alert (`${movie.title} added to your watchlist!`);
    } else {
      alert(`${movie.title} is already in your watchlist.`);
    }
  };

  return (
    <div className="bg-black min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-white mt-20">
        Movies
      </h1>


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
          className="bg-white text-black px-4 py-2 rounded-[20px] hover:cursor-pointer hover:opacity-[0.5]"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span className="text-white px-2 py-2">{page}</span>
        <button
          className="bg-white text-black px-4 py-2 rounded-[20px] hover:cursor-pointer hover:opacity-[0.5]"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>


      {selectedMovie && (
        <div
          id="modal-background"
          onClick={handleBackgroundClick}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-15 relative shadow-2xl">
            <button
              onClick={() => {
                setSelectedMovie(null);
                setTrailerKey(null);
              }}
              className="absolute top-3 right-3 text-gray-700 font-bold text-3xl hover:text-red-500 hover:cursor-pointer"
            >
              &times;
            </button>

            {!trailerKey ? (
              <>
                <img
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  className="w-full h-72 object-cover overflow-hidden rounded-2xl mb-4"
                />
                <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                <p className="mb-4">{selectedMovie.overview}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Release: {selectedMovie.release_date}
                </p>
                <p className="text-yellow-500 font-bold mb-4">
                  ⭐ {selectedMovie.vote_average.toFixed(1)}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAddToWatchlist(selectedMovie)}
                    className="bg-gray-600 p-3 text-white font-bold rounded-xl hover:shadow-xl hover:cursor-pointer flex-1"
                  >
                    Add to Watchlist
                  </button>
                  <button
                    onClick={() => handleWatchTrailer(selectedMovie.id)}
                    className="bg-red-600 p-3 text-white font-bold rounded-xl hover:shadow-xl hover:cursor-pointer flex-1"
                  >
                    Watch Trailer
                  </button>
                </div>
              </>
            ) : (
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Trailer"
                  allowFullScreen
                  className="rounded-xl"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
