const timestamp = new Date();

module.exports = {
  timestamp,
  iso: timestamp.toISOString(),
  year: timestamp.getUTCFullYear(),
  displayDate: new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(timestamp),
};
