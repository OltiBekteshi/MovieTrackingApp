import React, { useEffect, useState } from "react";

const MovieModal = ({
  selectedMovie,
  setSelectedMovie,
  trailerKey,
  setTrailerKey,
  handleAddToWatchlist,
  handleAddToWatchLater,
  handleWatchTrailer,
  apiKey,
}) => {
  const [runtime, setRuntime] = useState(null);

  const handleBackgroundClick = (e) => {
    if (e.target.id === "modal-background") {
      setSelectedMovie(null);
      setTrailerKey(null);
    }
  };

  useEffect(() => {
    if (!selectedMovie) return;

    const fetchRuntime = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedMovie.id}?api_key=${apiKey}&language=en-US`
        );
        const data = await res.json();
        setRuntime(data.runtime);
      } catch (err) {
        console.error("Failed to fetch movie runtime:", err);
        setRuntime(null);
      }
    };

    fetchRuntime();
  }, [selectedMovie, apiKey]);

  if (!selectedMovie) return null;

  return (
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
            <p className="text-sm text-gray-600 mb-2">
              Duration:{" "}
              {runtime
                ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                : "N/A"}
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
                onClick={() => handleAddToWatchLater(selectedMovie)}
                className="bg-gray-600 p-3 text-white font-bold rounded-xl hover:shadow-xl hover:cursor-pointer flex-1"
              >
                Add to Watch later
              </button>
            </div>

            <div>
              <button
                onClick={() => handleWatchTrailer(selectedMovie.id)}
                className="bg-red-600 p-3 w-full mt-3 text-white font-bold rounded-xl hover:shadow-xl hover:cursor-pointer flex-1"
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
  );
};

export default MovieModal;
