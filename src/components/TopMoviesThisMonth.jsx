import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import {
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchTopMoviesThisMonth } from "../utils/fetchTopMoviesThisMonth";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const REFETCH_INTERVAL_MS = 3 * 60 * 60 * 1000;

function heroBackdropUrl(movie) {
  if (movie.backdrop_path) {
    return `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
  }
  if (movie.poster_path) {
    return `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;
  }
  return "";
}

export default function TopMoviesThisMonth({
  apiKey,
  onMovieClick,
}) {
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);

  const load = useCallback(async () => {
    if (!apiKey) {
      setMovies([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    setErrorMessage(null);
    try {
      const list = await fetchTopMoviesThisMonth(apiKey);
      setMovies(list);
      setStatus("ready");
    } catch (e) {
      console.error("Top movies:", e);
      setErrorMessage(e?.message || "Could not load highlights.");
      setStatus("error");
    }
  }, [apiKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!apiKey) return undefined;
    const id = window.setInterval(load, REFETCH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [apiKey, load]);

  const rankById = useMemo(() => {
    const m = new Map();
    movies.forEach((mv, i) => m.set(mv.id, i + 1));
    return m;
  }, [movies]);

  if (!apiKey) {
    return null;
  }

  if (status === "loading" && movies.length === 0) {
    return (
      <section
        className="flex min-h-[50vh] w-full items-center justify-center bg-white"
        aria-busy="true"
        aria-label="Top movies this month"
      >
        <ClipLoader size={48} color="#293333" aria-label="Loading" />
      </section>
    );
  }

  if (status === "error" && movies.length === 0) {
    return (
      <section className="flex min-h-[40vh] w-full flex-col items-center justify-center bg-white px-4 py-12 text-center">
        <p className="text-sm text-red-700">{errorMessage}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Try again
        </button>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section
      className="top-movies-hero relative w-full overflow-hidden bg-white"
      aria-label="Top 10 movies this month"
    >
      <button
        type="button"
        className="top-movies-prev absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-4xl text-white/70 transition hover:scale-110 hover:text-white md:left-6 md:h-12 md:w-12"
        aria-label="Previous"
      >
        <FiChevronLeft className="h-10 w-10 drop-shadow-lg md:h-12 md:w-12" />
      </button>
      <button
        type="button"
        className="top-movies-next absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-4xl text-white/70 transition hover:scale-110 hover:text-white md:right-6 md:h-12 md:w-12"
        aria-label="Next"
      >
        <FiChevronRight className="h-10 w-10 drop-shadow-lg md:h-12 md:w-12" />
      </button>

      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        speed={900}
        loop={true}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        }}
        navigation={{
          prevEl: ".top-movies-prev",
          nextEl: ".top-movies-next",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="hero-swiper bg-white"
      >
        {movies.map((movie) => {
          const rank = rankById.get(movie.id) ?? 0;
          const bg = heroBackdropUrl(movie);
          const year = movie.release_date?.slice(0, 4) ?? "—";
          const rating = movie.vote_average?.toFixed(1) ?? "—";

          return (
            <SwiperSlide
              key={movie.id}
              className="!flex min-h-[min(62vh,640px)] items-stretch"
            >
              <div className="relative min-h-[min(62vh,640px)] w-full flex-1">
                {bg ? (
                  <img
                    src={bg}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-900" />
                )}

                {/* Cinematic gradients (Netflix-style readability) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

                <div className="relative z-10 flex min-h-[min(62vh,640px)] flex-col justify-end px-6 pb-20 pt-20 sm:justify-center sm:px-12 sm:pb-16 sm:pt-24 md:px-16 lg:max-w-[46%] lg:pb-20 lg:pr-8">
                  <span className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#e50914]">
                    Top 10 · #{rank}
                  </span>
                  <h2 className="text-3xl font-bold leading-tight tracking-wide text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-4xl md:text-5xl lg:text-6xl">
                    {movie.title}
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-green-400 drop-shadow-md">
                    <span className="text-green-500">⭐</span> {rating}{" "}
                    <span className="text-neutral-400">·</span>{" "}
                    <span className="text-neutral-200">{year}</span>
                  </p>
                  {movie.overview ? (
                    <p className="mt-4 line-clamp-3 max-w-xl text-base leading-snug text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-lg">
                      {movie.overview}
                    </p>
                  ) : null}
                  {movie.cast?.length ? (
                    <p className="mt-3 max-w-xl text-sm text-neutral-200 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] sm:text-base">
                      <span className="font-semibold text-white">Cast:</span>{" "}
                      {movie.cast.join(", ")}
                    </p>
                  ) : null}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onMovieClick?.(movie.id)}
                      className="flex items-center gap-2 rounded-md border-0 bg-white/25 px-6 py-2.5 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/35"
                    >
                      <FiInfo className="h-5 w-5" aria-hidden />
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style>{`
        .top-movies-hero .hero-swiper,
        .top-movies-hero .hero-swiper .swiper-wrapper {
          background-color: #ffffff;
        }
        .top-movies-hero .hero-swiper .swiper-pagination {
          bottom: 0.75rem !important;
          z-index: 25;
        }
        .top-movies-hero .swiper-pagination-bullet {
          background: rgba(0, 0, 0, 0.2);
          opacity: 1;
          width: 10px;
          height: 10px;
        }
        .top-movies-hero .swiper-pagination-bullet-active {
          background: #0d9488;
          transform: scale(1.15);
        }
      `}</style>
    </section>
  );
}
