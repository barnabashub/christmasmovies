import { LOCALES, type Locale } from './config'
import type { Genre, Holiday, Kind, Monetization } from './types'
import type { Sort } from './filters'

export interface Dictionary {
  tagline: string
  searchPlaceholder: string
  region: string
  uiLanguage: string
  filters: string
  clear: string
  any: string
  kind: Record<Kind, string>
  kindPlural: Record<Kind, string>
  genre: Record<Genre, string>
  holiday: Record<Holiday, string>
  sort: Record<Sort, string>
  offer: Record<Monetization, string>
  country: string
  originalLanguage: string
  decade: string
  occasion: string
  audio: string
  subtitles: string
  streamableOnly: string
  sortBy: string
  rows: {
    streaming: string
    classics: string
    episodes: string
    animated: string
    world: string
    romance: string
    mayhem: string
    series: string
    beyond: string
    recent: string
  }
  results: string
  noResults: string
  whereToWatch: string
  notAvailable: string
  checkJustWatch: string
  streamsIn: string
  originalTitle: string
  minutes: string
  close: string
  moreInfo: string
  noSync: string
  languagesUnknown: string
  attribution: string
  contribute: string
  syncedAt: string
  seasonEpisode: string
  special: string
  scrollLeft: string
  scrollRight: string
  watchOn: string
  moreEpisodes: string
  providerIn: string
}

const en: Dictionary = {
  tagline: 'Every Christmas story, from every corner of the world — and where to stream it tonight.',
  searchPlaceholder: 'Search movies, shows, episodes…',
  region: 'Region',
  uiLanguage: 'Language',
  filters: 'Filters',
  clear: 'Clear all',
  any: 'Any',
  kind: { movie: 'Movie', episode: 'Episode', series: 'Series' },
  kindPlural: { movie: 'Movies', episode: 'Episodes', series: 'Series' },
  genre: {
    action: 'Action',
    animation: 'Animation',
    comedy: 'Comedy',
    drama: 'Drama',
    family: 'Family',
    fantasy: 'Fantasy',
    horror: 'Horror',
    musical: 'Musical',
    romance: 'Romance',
    thriller: 'Thriller',
  },
  holiday: { christmas: 'Christmas', 'new-year': "New Year's Eve" },
  sort: { relevance: 'Relevance', newest: 'Newest', oldest: 'Oldest', rating: 'Top rated', title: 'A–Z' },
  offer: { flatrate: 'Subscription', free: 'Free', ads: 'Free with ads', rent: 'Rent', buy: 'Buy' },
  country: 'Country of origin',
  originalLanguage: 'Original language',
  decade: 'Decade',
  occasion: 'Occasion',
  audio: 'Audio',
  subtitles: 'Subtitles',
  streamableOnly: 'Streamable in {region}',
  sortBy: 'Sort by',
  rows: {
    streaming: 'Streaming now in {region}',
    classics: 'Timeless classics',
    episodes: 'Christmas episodes of everyday shows',
    animated: 'Animated wonders',
    world: 'Around the world',
    romance: 'Under the mistletoe',
    mayhem: 'Not-so-silent nights',
    series: 'Christmas, all season long',
    beyond: 'New Year & other winter traditions',
    recent: 'Fresh out of the oven',
  },
  results: '{count} titles',
  noResults: 'Nothing under the tree. Try loosening the filters.',
  whereToWatch: 'Where to watch in {region}',
  notAvailable: 'No streaming offers known in {region}.',
  checkJustWatch: 'Check on JustWatch',
  streamsIn: 'Streams in {count} countries',
  originalTitle: 'Original title',
  minutes: '{n} min',
  close: 'Close',
  moreInfo: 'More info',
  noSync: 'Streaming availability has not been synced yet.',
  languagesUnknown: 'Audio and subtitle data is not available for this region.',
  attribution: 'Streaming data by JustWatch via TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
  contribute: 'Missing a favourite? Add it on GitHub',
  syncedAt: 'Availability updated {date}',
  seasonEpisode: 'S{season} · E{episode}',
  special: 'Special',
  scrollLeft: 'Scroll left',
  scrollRight: 'Scroll right',
  watchOn: 'Watch on {provider}',
  moreEpisodes: 'More Christmas episodes of {series}',
  providerIn: 'Streaming service in {region}',
}

const hu: Dictionary = {
  tagline: 'Minden karácsonyi történet, a világ minden szegletéből — és hogy hol nézheted ma este.',
  searchPlaceholder: 'Filmek, sorozatok, epizódok keresése…',
  region: 'Régió',
  uiLanguage: 'Nyelv',
  filters: 'Szűrők',
  clear: 'Törlés',
  any: 'Bármelyik',
  kind: { movie: 'Film', episode: 'Epizód', series: 'Sorozat' },
  kindPlural: { movie: 'Filmek', episode: 'Epizódok', series: 'Sorozatok' },
  genre: {
    action: 'Akció',
    animation: 'Animáció',
    comedy: 'Vígjáték',
    drama: 'Dráma',
    family: 'Családi',
    fantasy: 'Fantasy',
    horror: 'Horror',
    musical: 'Musical',
    romance: 'Romantikus',
    thriller: 'Thriller',
  },
  holiday: { christmas: 'Karácsony', 'new-year': 'Szilveszter' },
  sort: { relevance: 'Relevancia', newest: 'Legújabb', oldest: 'Legrégebbi', rating: 'Legjobbra értékelt', title: 'A–Z' },
  offer: { flatrate: 'Előfizetés', free: 'Ingyenes', ads: 'Ingyenes, reklámokkal', rent: 'Kölcsönzés', buy: 'Vásárlás' },
  country: 'Származási ország',
  originalLanguage: 'Eredeti nyelv',
  decade: 'Évtized',
  occasion: 'Alkalom',
  audio: 'Szinkron / hang',
  subtitles: 'Felirat',
  streamableOnly: 'Streamelhető itt: {region}',
  sortBy: 'Rendezés',
  rows: {
    streaming: 'Most streamelhető itt: {region}',
    classics: 'Örök klasszikusok',
    episodes: 'Karácsonyi részek hétköznapi sorozatokból',
    animated: 'Animációs csodák',
    world: 'A világ körül',
    romance: 'A fagyöngy alatt',
    mayhem: 'Nem is olyan csendes éj',
    series: 'Egész évados karácsony',
    beyond: 'Szilveszter és más téli hagyományok',
    recent: 'Frissen a sütőből',
  },
  results: '{count} találat',
  noResults: 'Üres a fa alja. Próbálj lazítani a szűrőkön.',
  whereToWatch: 'Hol nézheted itt: {region}',
  notAvailable: 'Nincs ismert streaming ajánlat itt: {region}.',
  checkJustWatch: 'Megnézem a JustWatch-on',
  streamsIn: '{count} országban streamelhető',
  originalTitle: 'Eredeti cím',
  minutes: '{n} perc',
  close: 'Bezárás',
  moreInfo: 'Részletek',
  noSync: 'A streaming elérhetőség még nincs szinkronizálva.',
  languagesUnknown: 'Ehhez a régióhoz nincs szinkron- és feliratadat.',
  attribution: 'A streaming adatokat a JustWatch szolgáltatja a TMDB-n keresztül. Ez a termék a TMDB API-t használja, de a TMDB nem támogatja és nem tanúsítja.',
  contribute: 'Hiányzik a kedvenced? Add hozzá GitHubon',
  syncedAt: 'Elérhetőség frissítve: {date}',
  seasonEpisode: '{season}. évad · {episode}. rész',
  special: 'Különkiadás',
  scrollLeft: 'Görgetés balra',
  scrollRight: 'Görgetés jobbra',
  watchOn: 'Megnézem: {provider}',
  moreEpisodes: 'További karácsonyi részek: {series}',
  providerIn: 'Szolgáltató itt: {region}',
}

const de: Dictionary = {
  tagline: 'Jede Weihnachtsgeschichte aus jedem Winkel der Welt — und wo du sie heute Abend streamen kannst.',
  searchPlaceholder: 'Filme, Serien, Episoden suchen…',
  region: 'Region',
  uiLanguage: 'Sprache',
  filters: 'Filter',
  clear: 'Zurücksetzen',
  any: 'Alle',
  kind: { movie: 'Film', episode: 'Episode', series: 'Serie' },
  kindPlural: { movie: 'Filme', episode: 'Episoden', series: 'Serien' },
  genre: {
    action: 'Action',
    animation: 'Animation',
    comedy: 'Komödie',
    drama: 'Drama',
    family: 'Familie',
    fantasy: 'Fantasy',
    horror: 'Horror',
    musical: 'Musical',
    romance: 'Romantik',
    thriller: 'Thriller',
  },
  holiday: { christmas: 'Weihnachten', 'new-year': 'Silvester' },
  sort: { relevance: 'Relevanz', newest: 'Neueste', oldest: 'Älteste', rating: 'Beste Bewertung', title: 'A–Z' },
  offer: { flatrate: 'Abo', free: 'Kostenlos', ads: 'Kostenlos mit Werbung', rent: 'Leihen', buy: 'Kaufen' },
  country: 'Herkunftsland',
  originalLanguage: 'Originalsprache',
  decade: 'Jahrzehnt',
  occasion: 'Anlass',
  audio: 'Tonspur',
  subtitles: 'Untertitel',
  streamableOnly: 'Streambar in {region}',
  sortBy: 'Sortieren',
  rows: {
    streaming: 'Jetzt streambar in {region}',
    classics: 'Zeitlose Klassiker',
    episodes: 'Weihnachtsfolgen ganz normaler Serien',
    animated: 'Animierte Wunder',
    world: 'Rund um die Welt',
    romance: 'Unter dem Mistelzweig',
    mayhem: 'Gar nicht so stille Nächte',
    series: 'Weihnachten, die ganze Staffel lang',
    beyond: 'Silvester & andere Wintertraditionen',
    recent: 'Frisch aus dem Ofen',
  },
  results: '{count} Titel',
  noResults: 'Nichts unter dem Baum. Lockere die Filter etwas.',
  whereToWatch: 'Wo streamen in {region}',
  notAvailable: 'Keine Streaming-Angebote in {region} bekannt.',
  checkJustWatch: 'Auf JustWatch ansehen',
  streamsIn: 'In {count} Ländern streambar',
  originalTitle: 'Originaltitel',
  minutes: '{n} Min.',
  close: 'Schließen',
  moreInfo: 'Mehr Infos',
  noSync: 'Die Streaming-Verfügbarkeit wurde noch nicht synchronisiert.',
  languagesUnknown: 'Für diese Region gibt es keine Ton- und Untertiteldaten.',
  attribution: 'Streamingdaten von JustWatch über TMDB. Dieses Produkt nutzt die TMDB-API, ist aber nicht von TMDB unterstützt oder zertifiziert.',
  contribute: 'Fehlt dein Liebling? Füge ihn auf GitHub hinzu',
  syncedAt: 'Verfügbarkeit aktualisiert am {date}',
  seasonEpisode: 'S{season} · F{episode}',
  special: 'Special',
  scrollLeft: 'Nach links scrollen',
  scrollRight: 'Nach rechts scrollen',
  watchOn: 'Ansehen bei {provider}',
  moreEpisodes: 'Weitere Weihnachtsfolgen von {series}',
  providerIn: 'Streamingdienst in {region}',
}

export const dictionaries: Record<Locale, Dictionary> = { en, hu, de }

export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`))
}

export function detectLocale(): Locale {
  const preferred = navigator.languages.map((l) => l.slice(0, 2))
  return (preferred.find((l) => (LOCALES as readonly string[]).includes(l)) as Locale) ?? 'en'
}

export function detectRegion(fallback: string) {
  for (const language of navigator.languages) {
    const region = new Intl.Locale(language).maximize().region
    if (region && /^[A-Z]{2}$/.test(region)) return region
  }
  return fallback
}

export function displayNames(locale: Locale) {
  const regions = new Intl.DisplayNames([locale], { type: 'region' })
  const languages = new Intl.DisplayNames([locale], { type: 'language' })
  const safe = (names: Intl.DisplayNames) => (code: string) => {
    try {
      return names.of(code) ?? code
    } catch {
      return code
    }
  }
  return { region: safe(regions), language: safe(languages) }
}
