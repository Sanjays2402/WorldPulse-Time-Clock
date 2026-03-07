import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DateTime } from 'luxon'
import {
  ChevronDown,
  ChevronUp,
  CloudFog,
  CloudMoon,
  CloudRain,
  CloudSnow,
  Droplets,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Sun,
  ThermometerSun,
  Wind,
  X,
  Zap,
} from 'lucide-react'

type WeatherMood = 'sunny' | 'rainy' | 'snowy' | 'storm' | 'foggy' | 'cloudy' | 'night'

type DataSource = 'live' | 'demo'

type LocalWeatherMode = 'precise' | 'approximate'

interface CityPreset {
  id: string
  city: string
  country: string
  timezone: string
  lat: number
  lng: number
  signature: string
  signatureRgb: string
  landmark: string
  skyline: number[]
}

interface WeatherSnapshot {
  temp: number
  feelsLike: number
  humidity: number
  wind: number
  label: string
  mood: WeatherMood
  source: DataSource
}

interface ForecastDay {
  isoDate: string
  min: number
  max: number
  mood: WeatherMood
  label: string
}

interface ForecastSnapshot {
  days: ForecastDay[]
  source: DataSource
}

interface CityCardSnapshot {
  city: CityPreset
  local: DateTime
  weather: WeatherSnapshot
  isDay: boolean
  isBusinessHours: boolean
  status: 'Sleeping' | 'Awake' | 'Business Pulse'
}

interface SearchCandidate {
  city: string
  country: string
  admin1?: string
  timezone: string
  lat: number
  lng: number
}

interface SignatureTone {
  hex: string
  rgb: string
}

const DEFAULT_CITIES: CityPreset[] = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    signature: '#22d3ee',
    signatureRgb: '34, 211, 238',
    landmark: 'TOKYO TOWER',
    skyline: [22, 52, 30, 72, 34, 64, 26, 42, 32],
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    timezone: 'Asia/Dubai',
    lat: 25.2048,
    lng: 55.2708,
    signature: '#f59e0b',
    signatureRgb: '245, 158, 11',
    landmark: 'BURJ KHALIFA',
    skyline: [18, 34, 24, 88, 26, 50, 30, 58, 36],
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    lat: 48.8566,
    lng: 2.3522,
    signature: '#f5b7a1',
    signatureRgb: '245, 183, 161',
    landmark: 'EIFFEL',
    skyline: [20, 28, 22, 76, 24, 40, 20, 32, 26],
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    lat: 51.5072,
    lng: -0.1276,
    signature: '#34d399',
    signatureRgb: '52, 211, 153',
    landmark: 'BIG BEN',
    skyline: [18, 46, 28, 64, 30, 38, 26, 44, 24],
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    lat: 40.7128,
    lng: -74.006,
    signature: '#8b5cf6',
    signatureRgb: '139, 92, 246',
    landmark: 'EMPIRE',
    skyline: [34, 68, 42, 86, 48, 72, 36, 52, 40],
  },
  {
    id: 'los-angeles',
    city: 'Los Angeles',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    lat: 34.0549,
    lng: -118.2426,
    signature: '#f472b6',
    signatureRgb: '244, 114, 182',
    landmark: 'HOLLYWOOD',
    skyline: [20, 34, 26, 54, 30, 42, 24, 38, 22],
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    lat: -33.8688,
    lng: 151.2093,
    signature: '#38bdf8',
    signatureRgb: '56, 189, 248',
    landmark: 'OPERA',
    skyline: [16, 24, 18, 42, 26, 40, 18, 36, 20],
  },
  {
    id: 'sao-paulo',
    city: 'São Paulo',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    lat: -23.5505,
    lng: -46.6333,
    signature: '#fb7185',
    signatureRgb: '251, 113, 133',
    landmark: 'PAULISTA',
    skyline: [26, 54, 34, 66, 42, 58, 38, 50, 30],
  },
]

const BUSINESS_START = 9
const BUSINESS_END = 18
const STORAGE_KEY = 'worldpulse-ultra-cities'

const SIGNATURE_TONES: SignatureTone[] = [
  { hex: '#22d3ee', rgb: '34, 211, 238' },
  { hex: '#f59e0b', rgb: '245, 158, 11' },
  { hex: '#f472b6', rgb: '244, 114, 182' },
  { hex: '#8b5cf6', rgb: '139, 92, 246' },
  { hex: '#34d399', rgb: '52, 211, 153' },
  { hex: '#38bdf8', rgb: '56, 189, 248' },
  { hex: '#fb7185', rgb: '251, 113, 133' },
  { hex: '#c084fc', rgb: '192, 132, 252' },
]

function App() {
  const [now, setNow] = useState(DateTime.now())
  const [cities, setCities] = useState<CityPreset[]>(() => loadStoredCities())
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherSnapshot>>({})
  const [forecastMap, setForecastMap] = useState<Record<string, ForecastSnapshot>>({})
  const [localWeather, setLocalWeather] = useState<WeatherSnapshot | null>(null)
  const [localWeatherCity, setLocalWeatherCity] = useState<CityPreset | null>(null)
  const [localWeatherMode, setLocalWeatherMode] = useState<LocalWeatherMode>('precise')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchCandidate[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(DateTime.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
  }, [cities])

  useEffect(() => {
    let ignore = false
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined

    async function loadWeather() {
      const entries = await Promise.all(
        cities.map(async (city) => {
          try {
            return [city.id, await fetchCurrentWeather(city, apiKey)] as const
          } catch {
            const fallbackLocal = DateTime.now().setZone(city.timezone)
            return [city.id, buildDemoWeather(city, fallbackLocal)] as const
          }
        }),
      )

      if (!ignore) {
        setWeatherMap(Object.fromEntries(entries))
      }
    }

    void loadWeather()
    const interval = window.setInterval(() => void loadWeather(), 1000 * 60 * 10)

    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [cities])

  useEffect(() => {
    let ignore = false

    async function loadForecasts() {
      const entries = await Promise.all(
        cities.map(async (city) => {
          try {
            return [city.id, await fetchForecast(city)] as const
          } catch {
            const fallbackLocal = DateTime.now().setZone(city.timezone)
            return [city.id, buildDemoForecast(city, fallbackLocal)] as const
          }
        }),
      )

      if (!ignore) {
        setForecastMap(Object.fromEntries(entries))
      }
    }

    void loadForecasts()
    const interval = window.setInterval(() => void loadForecasts(), 1000 * 60 * 30)

    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [cities])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    let ignore = false
    const timeout = window.setTimeout(async () => {
      setSearching(true)

      try {
        const results = await searchCities(searchQuery)

        if (!ignore) {
          setSearchResults(results)
        }
      } catch {
        if (!ignore) {
          setSearchResults([])
        }
      } finally {
        if (!ignore) {
          setSearching(false)
        }
      }
    }, 280)

    return () => {
      ignore = true
      window.clearTimeout(timeout)
    }
  }, [searchQuery])

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const localTime = now.setZone(localZone)
  const localIsDay = localTime.hour >= 6 && localTime.hour < 18

  useEffect(() => {
    let ignore = false
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined

    async function loadLocalWeather() {
      const resolved = await resolveCurrentLocationCity(cities, localZone)

      const resolvedCity = resolved?.city ?? null

      if (!resolvedCity) {
        if (!ignore) {
          setLocalWeather(null)
          setLocalWeatherCity(null)
        }
        return
      }

      try {
        const snapshot = await fetchCurrentWeather(resolvedCity, apiKey)

        if (!ignore) {
          setLocalWeather(snapshot)
          setLocalWeatherCity(resolvedCity)
          setLocalWeatherMode(resolved.mode)
        }
      } catch {
        const fallbackLocal = DateTime.now().setZone(localZone)

        if (!ignore) {
          setLocalWeather(buildDemoWeather(resolvedCity, fallbackLocal))
          setLocalWeatherCity(resolvedCity)
          setLocalWeatherMode(resolved.mode)
        }
      }
    }

    void loadLocalWeather()

    return () => {
      ignore = true
    }
  }, [cities, localZone])

  const cards = useMemo<CityCardSnapshot[]>(() => {
    return cities.map((city) => {
      const local = now.setZone(city.timezone)
      const isDay = local.hour >= 6 && local.hour < 18
      const isBusinessHours = local.hour >= BUSINESS_START && local.hour < BUSINESS_END
      const status = isBusinessHours ? 'Business Pulse' : local.hour >= 7 && local.hour < 23 ? 'Awake' : 'Sleeping'

      return {
        city,
        local,
        weather: weatherMap[city.id] ?? buildDemoWeather(city, local),
        isDay,
        isBusinessHours,
        status,
      }
    })
  }, [cities, now, weatherMap])

  const awakeCount = cards.filter((card) => card.status !== 'Sleeping').length
  const businessCount = cards.filter((card) => card.isBusinessHours).length
  const liveWeatherCount = cards.filter((card) => card.weather.source === 'live').length

  function handleAddCity(candidate: SearchCandidate) {
    const nextCity = createCityFromSearch(candidate)

    setCities((current) => {
      const exists = current.some(
        (city) => city.timezone === nextCity.timezone || normalizeLabel(city.city) === normalizeLabel(nextCity.city),
      )

      if (exists) {
        return current
      }

      return [nextCity, ...current].slice(0, 16)
    })

    setSearchQuery('')
    setSearchResults([])
  }

  function handleRemoveCity(cityId: string) {
    setCities((current) => current.filter((city) => city.id !== cityId))
    setWeatherMap((current) => omitKey(current, cityId))
    setForecastMap((current) => omitKey(current, cityId))
    setExpandedCards((current) => omitKey(current, cityId))
  }

  function toggleExpanded(cityId: string) {
    setExpandedCards((current) => ({ ...current, [cityId]: !current[cityId] }))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03040a] text-white">
      <div className="aurora-mesh" />
      <div className="neon-grid absolute inset-0 opacity-40" />
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -30, 30, 0], scale: [1, 1.2, 0.9, 1] }}
        className="aurora-orb left-[8%] top-[8%] h-72 w-72 bg-cyan-400/35"
        transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        animate={{ x: [0, -90, 30, 0], y: [0, 50, -20, 0], scale: [1, 0.95, 1.18, 1] }}
        className="aurora-orb right-[10%] top-[20%] h-80 w-80 bg-fuchsia-500/30"
        transition={{ duration: 28, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        animate={{ x: [0, 40, -60, 0], y: [0, 20, -40, 0], scale: [1, 1.12, 0.88, 1] }}
        className="aurora-orb bottom-[4%] left-[30%] h-96 w-96 bg-amber-300/20"
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="glass-panel overflow-visible rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm uppercase tracking-[0.32em] text-cyan-100/80">
                <Sparkles size={14} className="text-cyan-300" />
                WorldPulse Ultra
              </div>
              <h1 className="font-orbitron bg-[linear-gradient(115deg,#67e8f9_0%,#c084fc_30%,#f472b6_62%,#fbbf24_100%)] bg-clip-text text-4xl font-black uppercase tracking-[0.18em] text-transparent sm:text-5xl lg:text-7xl">
                {localTime.toFormat('HH:mm:ss')}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.32em] text-white/55 sm:text-base">
                <span>{localTime.toFormat('cccc, dd LLL yyyy')}</span>
                <span className="h-1 w-1 rounded-full bg-cyan-300/80" />
                <span>{localZone}</span>
              </div>

              {localWeather ? (
                <div className="glass-chip mt-5 flex flex-col items-start gap-3 rounded-[1.4rem] px-4 py-3 text-white/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
                  <div className="flex min-w-0 items-center gap-3 self-stretch sm:self-auto">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white sm:h-11 sm:w-11">
                      {getWeatherIcon(localWeather.mood, localIsDay)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[0.58rem] uppercase tracking-[0.18em] text-white/45 sm:text-[0.62rem] sm:tracking-[0.24em]">
                        {localWeatherMode === 'precise' ? 'Current weather' : 'Approx. weather'}
                        {localWeatherCity ? ` · ${localWeatherCity.city}` : ''}
                      </div>
                      <div className="font-orbitron mt-1 text-lg font-bold uppercase tracking-[0.08em] text-white/92 sm:text-xl sm:tracking-[0.12em] xl:text-2xl xl:tracking-[0.14em]">
                        {Math.round(localWeather.temp)}°C
                      </div>
                    </div>
                  </div>

                  <div className="hidden h-8 w-px shrink-0 bg-white/10 sm:block" />

                  <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/58 sm:w-auto sm:gap-x-4 sm:text-xs sm:tracking-[0.22em]">
                    <span>{localWeather.label}</span>
                    <span>Feels {Math.round(localWeather.feelsLike)}°</span>
                    <span>Humidity {localWeather.humidity}%</span>
                    <span>Wind {Math.round(localWeather.wind)} km/h</span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-white/48 sm:text-[0.68rem] sm:tracking-[0.22em]">
                  <MapPin size={13} className="shrink-0 text-cyan-300/80" />
                  <span>Enable location to show local weather.</span>
                </div>
              )}
            </div>

            <div className="hidden w-full gap-4 sm:grid sm:grid-cols-3 xl:max-w-2xl">
              <HeroStat label="Tracked Cities" value={String(cards.length)} accent="cyan" />
              <HeroStat label="Awake Now" value={String(awakeCount)} accent="emerald" />
              <HeroStat label="Business Pulse" value={String(businessCount)} accent="fuchsia" />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative z-40 h-fit self-start">
              <div className="glass-chip flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
                <Search size={16} className="shrink-0 text-cyan-300" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search any real city or timezone-aware location"
                  className="w-full bg-transparent text-sm uppercase tracking-[0.18em] text-white/90 outline-none placeholder:text-white/30 sm:text-base"
                />
                {searching && <LoaderCircle size={16} className="animate-spin text-white/55" />}
              </div>

              <AnimatePresence>
                {(searching || searchResults.length > 0) && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="glass-panel relative z-30 mt-2 max-h-[24rem] overflow-y-auto rounded-[1.6rem] p-3"
                  >
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.city}-${result.timezone}-${result.lat}-${result.lng}`}
                            type="button"
                            onClick={() => handleAddCity(result)}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.08]"
                          >
                            <div>
                              <div className="font-rajdhani text-base font-semibold uppercase tracking-[0.18em] text-white/90">
                                {result.city}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/50">
                                <span>{result.country}</span>
                                {result.admin1 ? <span>{result.admin1}</span> : null}
                                <span>{result.timezone}</span>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400/12 px-3 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-cyan-100">
                              <Plus size={14} />
                              Add
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-4 text-sm uppercase tracking-[0.2em] text-white/45">
                        No live matches found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {cards.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <CityCard
                key={card.city.id}
                snapshot={card}
                forecast={forecastMap[card.city.id] ?? buildDemoForecast(card.city, card.local)}
                isExpanded={Boolean(expandedCards[card.city.id])}
                onToggleForecast={() => toggleExpanded(card.city.id)}
                onRemove={() => handleRemoveCity(card.city.id)}
              />
            ))}
          </section>
        ) : (
          <section className="glass-panel rounded-[2rem] p-10 text-center">
            <div className="font-orbitron text-2xl uppercase tracking-[0.2em] text-white/85">No cities tracked</div>
            <p className="mx-auto mt-3 max-w-xl text-white/55">
              Use live city search above to add any location and unlock its clock, weather, and expanded forecast.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent: 'cyan' | 'emerald' | 'fuchsia' }) {
  const accentClass =
    accent === 'cyan'
      ? 'from-cyan-300/20 to-cyan-500/5 text-cyan-100'
      : accent === 'emerald'
        ? 'from-emerald-300/20 to-emerald-500/5 text-emerald-100'
        : 'from-fuchsia-300/20 to-fuchsia-500/5 text-fuchsia-100'

  return (
    <div className={`rounded-[1.6rem] border border-white/12 bg-gradient-to-br ${accentClass} p-4 backdrop-blur-xl`}>
      <div className="text-xs uppercase tracking-[0.28em] text-white/55">{label}</div>
      <div className="font-orbitron mt-3 text-3xl font-bold tracking-[0.16em]">{value}</div>
    </div>
  )
}

function CityCard({
  snapshot,
  forecast,
  isExpanded,
  onToggleForecast,
  onRemove,
}: {
  snapshot: CityCardSnapshot
  forecast: ForecastSnapshot
  isExpanded: boolean
  onToggleForecast: () => void
  onRemove: () => void
}) {
  const offset = formatUtcOffset(snapshot.local.offset)
  const weatherIcon = getWeatherIcon(snapshot.weather.mood, snapshot.isDay)
  const cardStyle = buildCardStyle(snapshot)

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className={`group glass-panel relative overflow-hidden rounded-[2rem] p-5 ${isExpanded ? 'md:col-span-2 xl:col-span-2' : ''}`}
      style={cardStyle}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/15" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-full bg-white/12 blur-2xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: `radial-gradient(circle at top right, rgba(${snapshot.city.signatureRgb}, 0.22), transparent 46%)` }}
      />

      {snapshot.isBusinessHours && (
        <div
          className="business-ring pointer-events-none"
          style={{ borderColor: `rgba(${snapshot.city.signatureRgb}, 0.55)` }}
        />
      )}

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-rajdhani text-[0.7rem] uppercase tracking-[0.34em] text-white/50">
            {snapshot.city.country}
          </div>
          <h2 className="font-rajdhani mt-1 break-words text-2xl font-semibold uppercase tracking-[0.16em] text-white/95">
            {snapshot.city.city}
          </h2>
        </div>

        <div className="ml-auto flex max-w-full flex-col items-end gap-2">
          <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
            <span className="glass-chip max-w-full text-[0.7rem] tracking-[0.28em]">{offset}</span>
            <button
              type="button"
              onClick={onRemove}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${snapshot.city.city}`}
            >
              <X size={14} />
            </button>
          </div>
          <span
            className="max-w-full rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
            style={{ backgroundColor: `rgba(${snapshot.city.signatureRgb}, 0.18)`, color: snapshot.city.signature }}
          >
            {snapshot.status}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-orbitron card-time-glow text-[1.7rem] font-black leading-none tracking-[0.06em] text-white sm:text-[2rem] xl:text-[2.5rem]">
            {snapshot.local.toFormat('HH:mm')}
          </div>
          <div className="font-rajdhani mt-2 break-words text-[0.62rem] uppercase tracking-[0.14em] text-white/60 sm:text-[0.7rem] sm:tracking-[0.16em] xl:text-xs xl:tracking-[0.2em]">
            {snapshot.local.toFormat('ccc · dd LLL')} · {snapshot.local.toFormat('ZZZZ')}
          </div>
        </div>

        <div className="self-start">
          <WeatherVisual mood={snapshot.weather.mood} tint={snapshot.city.signatureRgb}>
          {weatherIcon}
          </WeatherVisual>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex items-center gap-3">
        <span
          className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.24em] text-white"
          style={{ background: `linear-gradient(135deg, rgba(${snapshot.city.signatureRgb}, 0.44), rgba(${snapshot.city.signatureRgb}, 0.16))` }}
        >
          {Math.round(snapshot.weather.temp)}°C
        </span>
        <span className="font-rajdhani text-sm uppercase tracking-[0.26em] text-white/68">
          {snapshot.weather.label}
        </span>
      </div>

      <motion.div layout className="relative z-10 mt-5 grid grid-cols-3 gap-3 text-left">
        <Metric label="Feels" value={`${Math.round(snapshot.weather.feelsLike)}°`} icon={<ThermometerSun size={14} />} />
        <Metric label="Humidity" value={`${snapshot.weather.humidity}%`} icon={<Droplets size={14} />} />
        <Metric label="Wind" value={`${Math.round(snapshot.weather.wind)} km/h`} icon={<Wind size={14} />} />
      </motion.div>

      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/48">
          <MapPin size={13} />
          <span>{forecast.source === 'live' ? 'Live forecast' : 'Forecast demo mode'}</span>
        </div>

        <button
          type="button"
          onClick={onToggleForecast}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-white/78 transition hover:bg-white/[0.1]"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Collapse' : 'Expand'} forecast
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative z-10 mt-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {forecast.days.map((day) => (
                <ForecastTile key={`${snapshot.city.id}-${day.isoDate}`} day={day} signatureRgb={snapshot.city.signatureRgb} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 top-[46%] overflow-hidden rounded-[1.6rem]">
        <div className="font-orbitron absolute -right-2 bottom-16 text-[3rem] font-black uppercase tracking-[0.22em] text-white/6 sm:text-[4rem]">
          {snapshot.city.landmark}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-24 items-end gap-[5px] opacity-75">
          {snapshot.city.skyline.map((height, index) => (
            <span
              key={`${snapshot.city.id}-${index}`}
              className="block flex-1 rounded-t-xl"
              style={{
                height: `${height}%`,
                background: `linear-gradient(180deg, rgba(${snapshot.city.signatureRgb}, 0.14), rgba(255,255,255,0.04) 28%, rgba(3,4,10,0.68))`,
                boxShadow: `0 0 18px rgba(${snapshot.city.signatureRgb}, 0.14)`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.article>
  )
}

function ForecastTile({ day, signatureRgb }: { day: ForecastDay; signatureRgb: string }) {
  const date = DateTime.fromISO(day.isoDate)

  return (
    <div
      className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 22px rgba(${signatureRgb}, 0.08)` }}
    >
      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">{date.toFormat('ccc')}</div>
      <div className="mt-1 font-rajdhani text-sm uppercase tracking-[0.18em] text-white/82">{date.toFormat('dd LLL')}</div>
      <div className="mt-3 flex items-center gap-2 text-white/90">{getWeatherIcon(day.mood, day.mood !== 'night')}</div>
      <div className="font-orbitron mt-3 text-sm font-bold tracking-[0.14em] text-white/88">
        {Math.round(day.max)}° / {Math.round(day.min)}°
      </div>
      <div className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-white/48">{day.label}</div>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl transition-all duration-300 group-hover:bg-white/[0.08]">
      <div className="mb-2 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-white/45">
        {icon}
        {label}
      </div>
      <div className="font-rajdhani text-sm font-semibold uppercase tracking-[0.16em] text-white/90">{value}</div>
    </div>
  )
}

function WeatherVisual({ mood, tint, children }: { mood: WeatherMood; tint: string; children: ReactNode }) {
  return (
    <div className="weather-shell relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/[0.06] sm:h-18 sm:w-18 sm:rounded-[1.25rem] xl:h-20 xl:w-20 xl:rounded-[1.35rem]">
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.1rem] opacity-80 sm:rounded-[1.25rem] xl:rounded-[1.35rem]"
        style={{ background: `radial-gradient(circle at center, rgba(${tint}, 0.24), transparent 68%)` }}
      />
      <div className={`weather-particles weather-${mood}`}>
        {Array.from({ length: mood === 'rainy' ? 10 : mood === 'snowy' ? 8 : mood === 'night' ? 7 : 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="relative z-10 scale-75 text-white sm:scale-85 xl:scale-90">{children}</div>
    </div>
  )
}

function getWeatherIcon(mood: WeatherMood, isDay: boolean) {
  switch (mood) {
    case 'sunny':
      return <Sun className="h-10 w-10 text-amber-300" strokeWidth={1.8} />
    case 'rainy':
      return <CloudRain className="h-10 w-10 text-sky-200" strokeWidth={1.8} />
    case 'snowy':
      return <CloudSnow className="h-10 w-10 text-cyan-100" strokeWidth={1.8} />
    case 'storm':
      return <Zap className="h-10 w-10 text-violet-200" strokeWidth={1.8} />
    case 'foggy':
      return <CloudFog className="h-10 w-10 text-slate-200" strokeWidth={1.8} />
    case 'night':
      return <CloudMoon className="h-10 w-10 text-indigo-100" strokeWidth={1.8} />
    default:
      return isDay ? <Sun className="h-10 w-10 text-cyan-100" strokeWidth={1.8} /> : <CloudMoon className="h-10 w-10 text-indigo-100" strokeWidth={1.8} />
  }
}

function buildCardStyle(snapshot: CityCardSnapshot): CSSProperties {
  const tone = snapshot.isDay
    ? 'linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))'
    : 'linear-gradient(180deg, rgba(9,11,28,0.72), rgba(5,7,16,0.9))'

  const weatherGlow = getWeatherGlow(snapshot.weather.mood, snapshot.city.signatureRgb, snapshot.isDay)

  return {
    background: `${tone}, ${weatherGlow}`,
    boxShadow: `0 28px 70px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.04), 0 0 32px rgba(${snapshot.city.signatureRgb}, 0.18)`,
  }
}

function getWeatherGlow(mood: WeatherMood, signatureRgb: string, isDay: boolean): string {
  switch (mood) {
    case 'sunny':
      return `radial-gradient(circle at top right, rgba(251,191,36,0.34), transparent 42%), radial-gradient(circle at bottom left, rgba(${signatureRgb}, 0.16), transparent 44%)`
    case 'rainy':
      return `radial-gradient(circle at top right, rgba(96,165,250,0.22), transparent 44%), linear-gradient(160deg, rgba(15,23,42,0.84), rgba(30,41,59,0.58))`
    case 'snowy':
      return `radial-gradient(circle at top right, rgba(191,219,254,0.26), transparent 44%), linear-gradient(160deg, rgba(12,24,42,0.86), rgba(8,47,73,0.58))`
    case 'storm':
      return `radial-gradient(circle at top right, rgba(168,85,247,0.28), transparent 42%), linear-gradient(160deg, rgba(24,24,48,0.88), rgba(40,12,60,0.62))`
    case 'foggy':
      return `radial-gradient(circle at top right, rgba(148,163,184,0.24), transparent 42%), linear-gradient(160deg, rgba(30,41,59,0.86), rgba(15,23,42,0.74))`
    case 'night':
      return `radial-gradient(circle at top right, rgba(99,102,241,0.24), transparent 44%), linear-gradient(160deg, rgba(7,10,30,0.92), rgba(10,18,48,0.68))`
    default:
      return isDay
        ? `radial-gradient(circle at top right, rgba(${signatureRgb}, 0.18), transparent 42%), linear-gradient(160deg, rgba(14,22,46,0.82), rgba(4,7,18,0.84))`
        : `radial-gradient(circle at top right, rgba(${signatureRgb}, 0.12), transparent 42%), linear-gradient(160deg, rgba(8,10,24,0.92), rgba(4,7,18,0.9))`
  }
}

function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60

  if (minutes === 0) {
    return `UTC${sign}${hours}`
  }

  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

function buildDemoWeather(city: CityPreset, local: DateTime): WeatherSnapshot {
  const conditions: WeatherMood[] = ['sunny', 'rainy', 'snowy', 'storm', 'foggy', 'cloudy', 'night']
  const indexSeed = city.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  const baseMood = local.hour >= 22 || local.hour < 5 ? 'night' : conditions[(indexSeed + local.hour) % 6]
  const tempBase = city.city === 'Dubai' ? 31 : city.city === 'Sydney' ? 24 : city.city === 'London' ? 11 : 19

  return {
    temp: tempBase + Math.sin(local.hour / 24 * Math.PI * 2) * 4,
    feelsLike: tempBase + Math.cos(local.hour / 24 * Math.PI * 2) * 3,
    humidity: 42 + ((indexSeed + local.minute) % 45),
    wind: 7 + ((indexSeed + local.hour) % 14),
    label: getMoodLabel(baseMood),
    mood: baseMood,
    source: 'demo',
  }
}

function buildDemoForecast(city: CityPreset, local: DateTime): ForecastSnapshot {
  const seed = hashString(city.id)
  const days = Array.from({ length: 5 }, (_, index) => {
    const day = local.plus({ days: index })
    const weather = buildDemoWeather(city, day)
    const daySpread = 5 + ((seed + index) % 4)

    return {
      isoDate: day.toISODate() ?? day.toFormat('yyyy-LL-dd'),
      min: weather.temp - daySpread,
      max: weather.temp + Math.max(2, daySpread - 1),
      mood: weather.mood,
      label: weather.label,
    }
  })

  return {
    days,
    source: 'demo',
  }
}

function mapOpenWeather(data: OpenWeatherResponse, city: CityPreset): WeatherSnapshot {
  const main = data.weather[0]?.main ?? 'Clear'
  const mood = getMoodFromOpenWeather(main, data.weather[0]?.id, city.timezone)

  return {
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    wind: data.wind.speed * 3.6,
    label: getMoodLabel(mood),
    mood,
    source: 'live',
  }
}

function mapOpenMeteoCurrent(data: OpenMeteoCurrentResponse): WeatherSnapshot {
  const current = data.current
  const mood = getMoodFromWeatherCode(current.weather_code, current.is_day === 1)

  return {
    temp: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    label: getMoodLabel(mood),
    mood,
    source: 'live',
  }
}

function mapOpenMeteoForecast(data: OpenMeteoForecastResponse): ForecastSnapshot {
  const days = data.daily.time.map((isoDate, index) => {
    const max = data.daily.temperature_2m_max[index]
    const min = data.daily.temperature_2m_min[index]
    const code = data.daily.weather_code[index]
    const date = DateTime.fromISO(isoDate)
    const mood = getMoodFromWeatherCode(code, date.weekday < 6)

    return {
      isoDate,
      min,
      max,
      mood,
      label: getMoodLabel(mood),
    }
  })

  return {
    days,
    source: 'live',
  }
}

function getMoodFromOpenWeather(main: string, code: number | undefined, timezone: string): WeatherMood {
  const localHour = DateTime.now().setZone(timezone).hour
  const isNight = localHour >= 20 || localHour < 6

  if (code !== undefined && code >= 200 && code < 300) {
    return 'storm'
  }

  if (code !== undefined && code >= 600 && code < 700) {
    return 'snowy'
  }

  if (code !== undefined && code >= 700 && code < 800) {
    return 'foggy'
  }

  if (main === 'Rain' || main === 'Drizzle') {
    return 'rainy'
  }

  if (main === 'Clouds') {
    return isNight ? 'night' : 'cloudy'
  }

  if (main === 'Clear') {
    return isNight ? 'night' : 'sunny'
  }

  return isNight ? 'night' : 'cloudy'
}

function getMoodFromWeatherCode(code: number, isDay: boolean): WeatherMood {
  if (code === 0) {
    return isDay ? 'sunny' : 'night'
  }

  if ([1, 2, 3].includes(code)) {
    return isDay ? 'cloudy' : 'night'
  }

  if ([45, 48].includes(code)) {
    return 'foggy'
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'rainy'
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'snowy'
  }

  if ([95, 96, 99].includes(code)) {
    return 'storm'
  }

  return isDay ? 'cloudy' : 'night'
}

function getMoodLabel(mood: WeatherMood): string {
  switch (mood) {
    case 'sunny':
      return 'Sunny Glow'
    case 'rainy':
      return 'Rain Drift'
    case 'snowy':
      return 'Snow Drift'
    case 'storm':
      return 'Storm Pulse'
    case 'foggy':
      return 'Fog Bloom'
    case 'night':
      return 'Moon Phase'
    default:
      return 'Cloud Layer'
  }
}

interface OpenWeatherResponse {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  wind: {
    speed: number
  }
  weather: Array<{
    id: number
    main: string
  }>
}

interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    wind_speed_10m: number
    weather_code: number
    is_day: 0 | 1
  }
}

interface OpenMeteoForecastResponse {
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string
    country: string
    admin1?: string
    timezone: string
    latitude: number
    longitude: number
  }>
}

async function fetchCurrentWeather(city: CityPreset, apiKey?: string): Promise<WeatherSnapshot> {
  if (apiKey) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&units=metric&appid=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error('Weather fetch failed')
    }

    const data = (await response.json()) as OpenWeatherResponse
    return mapOpenWeather(data, city)
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day&forecast_days=1&timezone=${encodeURIComponent(city.timezone)}`,
  )

  if (!response.ok) {
    throw new Error('Open-Meteo current weather failed')
  }

  const data = (await response.json()) as OpenMeteoCurrentResponse
  return mapOpenMeteoCurrent(data)
}

async function fetchForecast(city: CityPreset): Promise<ForecastSnapshot> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=${encodeURIComponent(city.timezone)}`,
  )

  if (!response.ok) {
    throw new Error('Forecast fetch failed')
  }

  const data = (await response.json()) as OpenMeteoForecastResponse
  return mapOpenMeteoForecast(data)
}

async function searchCities(query: string): Promise<SearchCandidate[]> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`,
  )

  if (!response.ok) {
    throw new Error('City search failed')
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse

  return (data.results ?? [])
    .filter((result) => result.timezone)
    .map((result) => ({
      city: result.name,
      country: result.country,
      admin1: result.admin1,
      timezone: result.timezone,
      lat: result.latitude,
      lng: result.longitude,
    }))
}

async function resolveCurrentLocationCity(
  cities: CityPreset[],
  timezone: string,
): Promise<{ city: CityPreset; mode: LocalWeatherMode } | null> {
  const geolocatedCity = await resolveBrowserLocationCity(timezone)

  if (geolocatedCity) {
    return { city: geolocatedCity, mode: 'precise' }
  }

  const trackedCity = cities.find((city) => city.timezone === timezone)

  if (trackedCity) {
    return { city: trackedCity, mode: 'approximate' }
  }

  const fallbackCity = await resolveLocalZoneCity(timezone)
  return fallbackCity ? { city: fallbackCity, mode: 'approximate' } : null
}

async function resolveBrowserLocationCity(timezone: string): Promise<CityPreset | null> {
  const position = await getCurrentBrowserPosition()

  if (!position) {
    return null
  }

  try {
    const candidate = await reverseGeocodeCity(position.latitude, position.longitude, timezone)
    return candidate ? createCityFromSearch(candidate) : null
  } catch {
    return null
  }
}

function getCurrentBrowserPosition(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 1000 * 60 * 10,
      },
    )
  })
}

async function reverseGeocodeCity(latitude: number, longitude: number, timezone: string): Promise<SearchCandidate | null> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`,
  )

  if (!response.ok) {
    throw new Error('Reverse geocoding failed')
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse
  const match =
    (data.results ?? []).find((result) => result.timezone === timezone) ??
    (data.results ?? [])[0]

  if (!match) {
    return null
  }

  return {
    city: match.name,
    country: match.country,
    admin1: match.admin1,
    timezone: match.timezone,
    lat: match.latitude,
    lng: match.longitude,
  }
}

async function resolveLocalZoneCity(timezone: string): Promise<CityPreset | null> {
  const fallbackName = timezone.split('/').at(-1)?.replace(/_/g, ' ').trim()

  if (!fallbackName) {
    return null
  }

  try {
    const results = await searchCities(fallbackName)
    const matched =
      results.find((result) => result.timezone === timezone) ??
      results.find((result) => normalizeLabel(result.city) === normalizeLabel(fallbackName)) ??
      results[0]

    return matched ? createCityFromSearch(matched) : null
  } catch {
    return null
  }
}

function loadStoredCities(): CityPreset[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return DEFAULT_CITIES
    }

    const parsed = JSON.parse(stored) as CityPreset[]

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CITIES
    }

    return parsed.filter(isStoredCityPreset)
  } catch {
    return DEFAULT_CITIES
  }
}

function isStoredCityPreset(value: unknown): value is CityPreset {
  if (!value || typeof value !== 'object') {
    return false
  }

  const city = value as Partial<CityPreset>
  return Boolean(
    city.id &&
      city.city &&
      city.country &&
      city.timezone &&
      typeof city.lat === 'number' &&
      typeof city.lng === 'number' &&
      city.signature &&
      city.signatureRgb &&
      city.landmark &&
      Array.isArray(city.skyline),
  )
}

function createCityFromSearch(candidate: SearchCandidate): CityPreset {
  const hash = hashString(`${candidate.city}-${candidate.country}-${candidate.timezone}`)
  const tone = SIGNATURE_TONES[hash % SIGNATURE_TONES.length]

  return {
    id: slugify(`${candidate.city}-${candidate.country}-${candidate.timezone}`),
    city: candidate.city,
    country: candidate.country,
    timezone: candidate.timezone,
    lat: candidate.lat,
    lng: candidate.lng,
    signature: tone.hex,
    signatureRgb: tone.rgb,
    landmark: buildLandmark(candidate),
    skyline: buildSkyline(hash),
  }
}

function buildLandmark(candidate: SearchCandidate): string {
  const source = candidate.admin1?.trim() || candidate.city.trim()
  return source
    .split(/\s+/)
    .slice(0, 2)
    .join(' ')
    .toUpperCase()
}

function buildSkyline(seed: number): number[] {
  return Array.from({ length: 9 }, (_, index) => 20 + ((seed + index * 19) % 58))
}

function hashString(value: string): number {
  return value.split('').reduce((total, character) => total + character.charCodeAt(0), 0)
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record }
  delete next[key]
  return next
}

export default App
