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
  const [ setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [overviewCache, setOverviewCache] = useState({});

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const genres = [
    { id: 28, name: "Aksion" },
    { id: 35, name: "Komedi" },
    { id: 53, name: "Thriller" },
    { id: 27, name: "Horror" },
    { id: 99, name: "Dokumentar" },
    { id: 9648, name: "Mister" },
  ];

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
            const translated = await translateText(movie.overview, "sq");
            return { ...movie, overview: translated };
          })
        );

        setMovies(translatedMovies);
        setTotalPages(data.total_pages || 1);
      } catch {
        ("");
      }
    };

    fetchMovies();
  }, );

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
    <div className="bg-gradient-to-r from-blue-500 to-green-900 min-h-screen p-6">

      
     <div className="w-full flex justify-start mb-6 mt-20">
  <div className="relative w-56">

    <select
      className="
        w-full appearance-none
        bg-white/10 text-white
        px-5 py-3 pr-12
        rounded-xl shadow-lg
        backdrop-blur-lg border border-white/20
        cursor-pointer
        transition-all duration-300
        hover:bg-white/20 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-white/30
      "
      defaultValue=""
      onChange={(e) => {
        setSelectedGenre(e.target.value);
        setPage(1);
      }}
    >
      <option className="bg-black text-white font-bold " value="">
        Të gjithë filmat
      </option>

      {genres.map((g) => (
        <option key={g.id} value={g.id} className="bg-white text-black">
          {g.name}
        </option>
      ))}
    </select>

    <span
      className="
        absolute right-4 top-1/2 -translate-y-1/2
        pointer-events-none text-white opacity-70
      "
    >
      ▼
    </span>
  </div>
</div>


      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Filmat
      </h1>

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
              alt={movie.title}
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{movie.title}</h3>

              <p className="truncate">{movie.overview}</p>

              <p className="text-sm mt-1">{movie.release_date}</p>

              <p className="text-white text-sm mt-1 font-bold">
                Kohezgjatja:{" "}
                {movieDetails[movie.id]
                  ? `${Math.floor(movieDetails[movie.id] / 60)}h ${
                      movieDetails[movie.id] % 60
                    }m`
                  : "N/A"}
              </p>

              <p className="text-yellow-400 font-bold mt-1">
                ⭐ {movie.vote_average.toFixed(1)}
              </p>

              <button className="bg-gray-800 p-2 w-full mt-3 rounded-lg hover:cursor-pointer">
                Shiko Detajet
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button
          className="bg-gray-800 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:cursor-pointer hover:bg-gray-900"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Pas
        </button>

        <span className="text-white text-lg">Faqja {page}</span>

        <button
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:cursor-pointer hover:bg-gray-900"
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
