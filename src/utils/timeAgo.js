const DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

/**
 * DB timestamps often arrive as ISO strings without a timezone suffix.
 * ES parses those as *local* time, but Postgres stores them in UTC, which
 * skews "time ago" by the user's UTC offset (e.g. always ~2h in CEST).
 */
function parseInstant(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);

  const s = String(value).trim();
  if (!s) return new Date(NaN);

  if (/[zZ]\s*$/.test(s)) return new Date(s);
  if (/[+\-]\d{2}:\d{2}\s*$/.test(s)) return new Date(s);
  if (/[+\-]\d{4}\s*$/.test(s)) return new Date(s);

  const isoT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;
  const isoSpace = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/;
  if (isoT.test(s)) return new Date(`${s}Z`);
  if (isoSpace.test(s)) return new Date(`${s.replace(" ", "T")}Z`);

  return new Date(s);
}

export function formatTimeAgo(value) {
  if (!value) return "";

  const date = parseInstant(value);
  if (Number.isNaN(date.getTime())) return "";

  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(
        Math.round(duration),
        division.unit
      );
    }
    duration /= division.amount;
  }

  return "";
}
