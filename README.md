# 🎄 Christmas Movies

**Every Christmas story, from every corner of the world — and where to stream it tonight.**

Christmas Movies is a Netflix-style browser for Christmas movies, Christmas-themed series and the Christmas episodes of
everyday shows (Friends, The Office, The Simpsons…). Big classics sit next to smaller countries' own holiday
traditions: Czech fairy tales, Polish rom-coms, Finnish horror, Norwegian series, Hungarian rom-coms.

- 🔎 Accent-insensitive search across English, original and localised titles
- 🎛 Filters: kind, genre, occasion, country of origin, original language, decade, streaming service, audio, subtitles
- 📺 Where to watch — per region, by subscription / free / rent / buy
- 🌍 UI in English, Magyar and Deutsch; region auto-detected from the browser
- 🔗 Every view is a shareable URL (filters and the open title live in the hash)
- ⚡ Fully static — deploys to GitHub Pages

## How the data works

| Layer | Source | Where |
| --- | --- | --- |
| Catalog (what counts as a Christmas title) | Hand-curated | [`catalog/titles.json`](catalog/titles.json) |
| Posters, backdrops, ratings, localised titles & overviews | [TMDB](https://www.themoviedb.org) | `public/data/enrichment.json` (generated) |
| Streaming offers per country | [JustWatch](https://www.justwatch.com) via the TMDB watch-provider API | `public/data/availability/{REGION}.json` (generated) |
| Audio & subtitle languages and direct “play” links per country *(optional)* | [Streaming Availability API](https://www.movieofthenight.com/about/api) | merged into the region files |

The site works without any generated data (it falls back to generated posters and JustWatch search links), so the
catalog is always browsable. The GitHub Action runs the sync every night, so availability stays fresh.

### Regions, dubs and subtitles

Streaming catalogues differ per country, so availability is fetched for every region TMDB/JustWatch covers and
split into one small file per region; the browser only downloads the region you are looking at.

There is no free, open dataset for audio/subtitle tracks. TMDB/JustWatch do not expose them. The Streaming
Availability API (RapidAPI, free tier available) does, for ~60 countries — set `RAPIDAPI_KEY` to enable it. It also provides
direct links that open the title in the streaming app; without it, the provider logos open the TMDB watch page.
Without it, the *Audio* filter falls back to the original language and the *Subtitles* filter is hidden.

Episodes inherit the availability of their series, since providers license whole shows.

## Development

```bash
npm install
npm run dev
```

```bash
npm test            # unit tests
npm run validate    # checks catalog/titles.json
TMDB_TOKEN=… npm run sync   # optional: fetch metadata & availability into public/data
```

`TMDB_TOKEN` is a TMDB *API Read Access Token* (free at themoviedb.org → Settings → API).

## Deploying to GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. **Settings → Secrets and variables → Actions**: add `TMDB_TOKEN` (and optionally `RAPIDAPI_KEY`)
   - For `RAPIDAPI_KEY`, subscribe to the *Streaming Availability* API on RapidAPI first (the free Basic plan
     works) — otherwise every request is rejected with 403. Responses are cached between runs (`actions/cache`)
     and at most `RAPIDAPI_LIMIT` (default 80) titles are refreshed per run, so the free quota is enough.
3. Push to `main`. The workflow validates, tests, syncs, builds and deploys — and re-runs nightly.

## Contributing titles

See [CONTRIBUTING.md](CONTRIBUTING.md). Local Christmas films from your country are especially welcome!

---

This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming data by JustWatch.
