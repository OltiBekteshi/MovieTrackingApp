/**
 * TMDB: top movies for the current calendar month (by popularity), up to 10.
 * If the month has fewer than 10 qualifying titles, fills from /movie/popular (deduped).
 */

function getCurrentMonthDateRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { gte: fmt(start), lte: fmt(end) };
}

async function fetchMovieCast(apiKey, movieId) {
  try {
    const creditsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}&language=en-US`
    );
    if (!creditsRes.ok) {
      return [];
    }
    const creditsData = await creditsRes.json();
    return (creditsData.cast || [])
      .slice(0, 3)
      .map((actor) => actor.name)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchTopMoviesThisMonth(apiKey) {
  if (!apiKey) return [];

  const { gte, lte } = getCurrentMonthDateRange();
  const discoverUrl = new URL(
    "https://api.themoviedb.org/3/discover/movie"
  );
  discoverUrl.searchParams.set("api_key", apiKey);
  discoverUrl.searchParams.set("language", "en-US");
  discoverUrl.searchParams.set("sort_by", "popularity.desc");
  discoverUrl.searchParams.set("primary_release_date.gte", gte);
  discoverUrl.searchParams.set("primary_release_date.lte", lte);
  discoverUrl.searchParams.set("page", "1");

  const res = await fetch(discoverUrl.toString());
  if (!res.ok) {
    throw new Error(`TMDB discover failed (${res.status})`);
  }
  const data = await res.json();
  let list = (data.results || [])
    .filter((m) => m.poster_path)
    .slice(0, 10);

  if (list.length < 10) {
    const popRes = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
    );
    if (!popRes.ok) {
      throw new Error(`TMDB popular failed (${popRes.status})`);
    }
    const popData = await popRes.json();
    const seen = new Set(list.map((m) => m.id));
    for (const m of popData.results || []) {
      if (list.length >= 10) break;
      if (m.poster_path && !seen.has(m.id)) {
        seen.add(m.id);
        list.push(m);
      }
    }
  }

  const topTen = list.slice(0, 10);
  const withCast = await Promise.all(
    topTen.map(async (movie) => {
      const cast = await fetchMovieCast(apiKey, movie.id);
      return { ...movie, cast };
    })
  );

  return withCast;
}
