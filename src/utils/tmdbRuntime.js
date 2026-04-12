const TMDB_DETAIL = (id, apiKey) =>
  `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-EN`;

export async function fetchMovieRuntime(movieId, apiKey) {
  const res = await fetch(TMDB_DETAIL(movieId, apiKey));
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json();
  return data.runtime ?? 0;
}

export async function fetchRuntimesInPools(movieIds, apiKey, concurrency, onProgress) {
  const ids = [...new Set(movieIds)];
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const runtime = await fetchMovieRuntime(id, apiKey);
          onProgress(id, runtime);
        } catch {
          onProgress(id, 0);
        }
      })
    );
  }
}
