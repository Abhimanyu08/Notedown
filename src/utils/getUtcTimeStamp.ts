function getUTCTimestamp() {
  const now = new Date();
  const timestampUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
  return timestampUTC;
}

export default getUTCTimestamp

// Get the current UTC timestamp (milliseconds since January 1, 1970)
