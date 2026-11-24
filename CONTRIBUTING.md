# Adding a title

All titles live in [`catalog/titles.json`](catalog/titles.json). Add an object and open a pull request — CI checks it
with `npm run validate`.

```jsonc
{
  "id": "letters-to-santa",            // unique, kebab-case
  "kind": "movie",                     // movie | series | episode
  "title": "Letters to Santa",         // international (English) title
  "originalTitle": "Listy do M.",      // optional, if different
  "year": 2011,
  "countries": ["PL"],                 // ISO 3166-1 alpha-2
  "languages": ["pl"],                 // original language(s), ISO 639-1
  "genres": ["romance", "comedy"],     // action animation comedy drama family fantasy horror musical romance thriller
  "holiday": "christmas",              // optional: christmas (default) | new-year
  "classic": true,                     // optional: shows up in "Timeless classics"
  "tmdbId": 123456                     // optional: the number from the themoviedb.org URL, if auto-matching picks wrong
}
```

A Christmas episode of a non-Christmas show:

```json
{
  "id": "friends-holiday-armadillo",
  "kind": "episode",
  "title": "The One with the Holiday Armadillo",
  "year": 2000,
  "countries": ["US"],
  "languages": ["en"],
  "genres": ["comedy"],
  "series": { "title": "Friends", "firstAired": 1994, "season": 7, "episode": 10 }
}
```

The sync matches episodes by title within the season, so a wrong episode number is corrected automatically
(and reported as a warning in the workflow log).
