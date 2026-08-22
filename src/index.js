import "./styles.css";
import { weatherIconSVG, skyCategory, isNight, accentColor } from "./icons";

// ============================================
// CONFIGURATION & STATE
// ============================================

const API_KEY = "PR2RC4B958BDS5Z6CAVEGHX86";
const API_BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const WIKI_SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary";
const DAYS_SHOWN = 8;

let isCelsius = true;
let currentWeatherData = null;
let selectedDayIndex = 0;
let selectedHourIndex = 0;

// ============================================
// DOM ELEMENTS
// ============================================

const searchForm = document.getElementById("searchForm");
const locationInput = document.getElementById("locationInput");
const toggleTempBtn = document.getElementById("toggleTemp");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("errorMessage");
const bulletin = document.getElementById("currentWeather");
const bgPhoto = document.getElementById("bgPhoto");
const bgSky = document.getElementById("bgSky");
const dayRail = document.getElementById("dayRail");
const hourRail = document.getElementById("hourRail");
const sparkline = document.getElementById("sparkline");
const detailGrid = document.getElementById("detailGrid");

// ============================================
// UNIT CONVERSION
// ============================================

function convertTemp(fahrenheit) {
  return isCelsius
    ? Math.round(((fahrenheit - 32) * 5) / 9)
    : Math.round(fahrenheit);
}

function convertSpeed(mph) {
  return isCelsius ? Math.round(mph * 1.60934) : Math.round(mph);
}

function convertVisibility(miles) {
  return isCelsius
    ? Math.round(miles * 1.60934 * 10) / 10
    : Math.round(miles * 10) / 10;
}

// ============================================
// DATA FETCHING
// ============================================

async function fetchWeatherData(location) {
  const url = `${API_BASE_URL}/${encodeURIComponent(location)}?key=${API_KEY}&contentType=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather API error");
  return response.json();
}

// Fetches a Wikipedia summary and returns its photo, if any. When the name
// is ambiguous (e.g. "New York" matches the state, the city, a magazine...)
// Wikipedia flags it with type: "disambiguation" — in that case we retry
// once with "City" appended, which resolves it for most city names.
async function fetchWikiSummary(name, allowDisambiguationRetry = true) {
  try {
    const res = await fetch(`${WIKI_SUMMARY_URL}/${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json.type === "disambiguation") {
      return allowDisambiguationRetry
        ? fetchWikiSummary(`${name} City`, false)
        : null;
    }
    const source = json.thumbnail?.source || json.originalimage?.source;
    return source ? source.replace(/\/\d+px-/, "/1280px-") : null;
  } catch {
    return null;
  }
}

// Looks up a real photo for the resolved location via Wikipedia's public
// REST summary endpoint (no API key required). Tries the short city name
// first, then the full resolved address, and gives up gracefully.
async function fetchCityPhoto(resolvedAddress) {
  const candidates = [resolvedAddress.split(",")[0].trim(), resolvedAddress];
  for (const name of candidates) {
    const photo = await fetchWikiSummary(name);
    if (photo) return photo;
  }
  return null;
}

// ============================================
// BACKGROUND: PHOTO + PROCEDURAL SKY
// ============================================

function setCityPhoto(url) {
  bgPhoto.style.backgroundImage = url ? `url(${url})` : "none";
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function buildSky(icon) {
  const category = skyCategory(icon);
  const night = isNight(icon);

  bgSky.className = `bg-sky ${category}${night ? " is-night" : ""}`;
  bgSky.innerHTML = "";
  document.documentElement.style.setProperty(
    "--accent",
    accentColor(category, night),
  );

  // Day/night wash — present under every condition, independent of the
  // weather category, so a rainy night reads differently from a rainy noon.
  const tint = document.createElement("div");
  tint.className = "sky-tint";
  bgSky.appendChild(tint);

  if (category === "clear" || category === "partly-cloudy") {
    const glow = document.createElement("div");
    glow.className = "sun-glow";
    bgSky.appendChild(glow);

    const rays = document.createElement("div");
    rays.className = "sun-rays";
    bgSky.appendChild(rays);

    if (night) {
      for (let i = 0; i < 70; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${rand(0, 60)}%`;
        star.style.left = `${rand(0, 100)}%`;
        star.style.setProperty("--size", `${rand(1.5, 3)}px`);
        star.style.animationDelay = `${rand(0, 3)}s`;
        star.style.animationDuration = `${rand(2.4, 4)}s`;
        bgSky.appendChild(star);
      }
    }
  }

  if (
    category === "partly-cloudy" ||
    category === "cloudy" ||
    category === "rain" ||
    category === "storm"
  ) {
    const count = category === "cloudy" ? 4 : 2;
    for (let i = 0; i < count; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud-blob";
      cloud.style.top = `${rand(-5, 35)}%`;
      cloud.style.left = `${rand(-20, 60)}%`;
      cloud.style.opacity = rand(0.4, 0.8);
      cloud.style.animationDuration = `${rand(18, 32)}s`;
      cloud.style.animationDelay = `${rand(-10, 0)}s`;
      bgSky.appendChild(cloud);
    }
  }

  if (category === "rain" || category === "storm") {
    const count = category === "storm" ? 110 : 70;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop";
      drop.style.setProperty("--x", `${rand(-5, 105)}%`);
      drop.style.setProperty("--len", `${rand(30, 70)}px`);
      drop.style.animationDuration =
        category === "storm" ? `${rand(0.25, 0.45)}s` : `${rand(0.4, 0.75)}s`;
      drop.style.animationDelay = `${rand(-2, 0)}s`;
      bgSky.appendChild(drop);
    }
  }

  if (category === "storm") {
    const flash1 = document.createElement("div");
    flash1.className = "lightning";
    const flash2 = document.createElement("div");
    flash2.className = "lightning delay";
    bgSky.appendChild(flash1);
    bgSky.appendChild(flash2);
  }

  if (category === "snow") {
    for (let i = 0; i < 45; i++) {
      const flake = document.createElement("div");
      flake.className = "snow-flake";
      flake.style.setProperty("--x", `${rand(0, 100)}%`);
      flake.style.setProperty("--size", `${rand(2, 5)}px`);
      flake.style.setProperty("--drift", `${rand(-30, 30)}px`);
      flake.style.animationDuration = `${rand(6, 14)}s`;
      flake.style.animationDelay = `${rand(-10, 0)}s`;
      bgSky.appendChild(flake);
    }
  }

  if (category === "fog" || category === "wind") {
    const layers = [
      { bottom: "-15%", height: "60%", duration: 9, delay: 0 },
      { bottom: "-5%", height: "40%", duration: 7, delay: -3 },
    ];
    layers.forEach((layer) => {
      const rise = document.createElement("div");
      rise.className = "fog-rise";
      rise.style.setProperty("--bottom", layer.bottom);
      rise.style.setProperty("--height", layer.height);
      rise.style.animationDuration = `${layer.duration}s`;
      rise.style.animationDelay = `${layer.delay}s`;
      bgSky.appendChild(rise);
    });
  }
}

// ============================================
// RENDERING
// ============================================

function weekdayLabel(datetime, index) {
  if (index === 0) return "Today";
  return new Date(`${datetime}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

// Fades the scrollable rail's edges — short on the left (so "today"/the
// first hour never looks clipped) and only once there's actually something
// to scroll back to; longer on the right to hint more content follows.
function updateEdgeFade(el, leftWidth = 10, rightWidth = 26) {
  const maxScroll = el.scrollWidth - el.clientWidth;
  const atStart = el.scrollLeft <= 2;
  const atEnd = maxScroll <= 2 || el.scrollLeft >= maxScroll - 2;
  const left = atStart ? "black 0" : `transparent 0, black ${leftWidth}px`;
  const right = atEnd
    ? "black 100%"
    : `black calc(100% - ${rightWidth}px), transparent 100%`;
  const mask = `linear-gradient(to right, ${left}, ${right})`;
  el.style.webkitMaskImage = mask;
  el.style.maskImage = mask;
}

function renderDayRail(data) {
  dayRail.innerHTML = "";
  data.days.slice(0, DAYS_SHOWN).forEach((day, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `day-chip${index === selectedDayIndex ? " is-active" : ""}`;
    chip.innerHTML = `
            <span class="day-name">${weekdayLabel(day.datetime, index)}</span>
            ${weatherIconSVG(day.icon)}
            <span class="day-temps"><span class="hi">${convertTemp(day.tempmax)}°</span><span class="lo">${convertTemp(day.tempmin)}°</span></span>
        `;
    chip.addEventListener("click", () => {
      selectedDayIndex = index;
      selectedHourIndex = index === 0 ? closestHourIndex(data) : 12;
      render();
    });
    dayRail.appendChild(chip);
  });
  updateEdgeFade(dayRail);
}

function renderHourRail(day) {
  hourRail.innerHTML = "";
  day.hours.forEach((hour, index) => {
    const tick = document.createElement("button");
    tick.type = "button";
    tick.className = `hour-tick${index === selectedHourIndex ? " is-active" : ""}`;
    tick.innerHTML = `
            <span>${hour.datetime.slice(0, 2)}</span>
            ${weatherIconSVG(hour.icon)}
            <span class="hour-temp">${convertTemp(hour.temp)}°</span>
        `;
    tick.addEventListener("click", () => {
      selectedHourIndex = index;
      render();
    });
    hourRail.appendChild(tick);
  });
  updateEdgeFade(hourRail);
}

function renderSparkline(day) {
  const temps = day.hours.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;
  const stepX = 240 / (temps.length - 1);

  const points = temps.map((t, i) => {
    const x = i * stepX;
    const y = 34 - ((t - min) / range) * 30;
    return [x, y];
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fillPath = `${linePath} L240,40 L0,40 Z`;
  const [selX, selY] = points[selectedHourIndex] || points[0];

  sparkline.innerHTML = `
        <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <path class="fill" d="${fillPath}"></path>
        <path class="line" d="${linePath}"></path>
        <circle cx="${selX.toFixed(1)}" cy="${selY.toFixed(1)}" r="3"></circle>
    `;
}

function renderDetails(day, point) {
  const tempUnit = isCelsius ? "°C" : "°F";
  const speedUnit = isCelsius ? "km/h" : "mph";
  const visUnit = isCelsius ? "km" : "mi";

  const items = [
    ["Feels like", `${convertTemp(point.feelslike)}${tempUnit}`],
    ["Humidity", `${Math.round(point.humidity)}%`],
    ["Wind", `${convertSpeed(point.windspeed)} ${speedUnit}`],
    [
      "Wind gust",
      `${convertSpeed(point.windgust ?? point.windspeed)} ${speedUnit}`,
    ],
    ["Precip.", `${Math.round(point.precipprob ?? 0)}%`],
    ["Pressure", `${Math.round(point.pressure)} hPa`],
    ["Cloud cover", `${Math.round(point.cloudcover)}%`],
    ["Visib.", `${convertVisibility(point.visibility)} ${visUnit}`],
    ["Sunrise", day.sunrise?.slice(0, 5) ?? "–"],
    ["Sunset", day.sunset?.slice(0, 5) ?? "–"],
  ];

  detailGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <div class="detail-item">
            <span class="detail-label">${label}</span>
            <span class="detail-value">${value}</span>
        </div>
    `,
    )
    .join("");
}

function closestHourIndex(data) {
  const nowHour = data.currentConditions.datetime.slice(0, 2);
  const hours = data.days[0].hours;
  const found = hours.findIndex((h) => h.datetime.slice(0, 2) === nowHour);
  return found === -1 ? 12 : found;
}

function render() {
  const data = currentWeatherData;
  if (!data) return;

  const day = data.days[selectedDayIndex];
  const point = day.hours[selectedHourIndex];
  const tempUnit = isCelsius ? "°C" : "°F";

  const capitalizedAddress =
    data.resolvedAddress.charAt(0).toUpperCase() +
    data.resolvedAddress.slice(1);
  document.getElementById("location").textContent = capitalizedAddress;

  const dateLabel = new Date(`${day.datetime}T12:00:00`).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  );
  const momentLabel =
    selectedDayIndex === 0 && selectedHourIndex === closestHourIndex(data)
      ? "Now"
      : `${dateLabel} · ${point.datetime.slice(0, 5)}`;
  document.getElementById("selectedMoment").textContent = momentLabel;

  document.getElementById("weatherIcon").innerHTML = weatherIconSVG(point.icon);
  document.getElementById("temp").textContent =
    `${convertTemp(point.temp)}${tempUnit}`;
  document.getElementById("description").textContent = point.conditions;

  renderDayRail(data);
  renderHourRail(day);
  renderSparkline(day);
  renderDetails(day, point);
  buildSky(point.icon);

  bulletin.classList.remove("hidden");

  // Re-measure now that the panel is actually laid out — while `.bulletin`
  // was still `display: none`, scrollWidth/clientWidth both read 0, so the
  // edge fades above were computed as "nothing to scroll" every time.
  updateEdgeFade(dayRail);
  updateEdgeFade(hourRail);
}

// ============================================
// UI STATE
// ============================================

function showLoading() {
  loadingDiv.classList.remove("hidden");
  errorDiv.classList.add("hidden");
  bulletin.classList.add("hidden");
}

function hideLoading() {
  loadingDiv.classList.add("hidden");
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  loadingDiv.classList.add("hidden");
  bulletin.classList.add("hidden");
}

// ============================================
// LOAD FLOW
// ============================================

async function loadLocation(location) {
  showLoading();
  try {
    currentWeatherData = await fetchWeatherData(location);
    selectedDayIndex = 0;
    selectedHourIndex = closestHourIndex(currentWeatherData);
    render();
    hideLoading();
    fetchCityPhoto(currentWeatherData.resolvedAddress).then(setCityPhoto);
  } catch {
    showError(
      `Could not find weather data for "${location}". Try another location.`,
    );
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

dayRail.addEventListener("scroll", () => updateEdgeFade(dayRail));
hourRail.addEventListener("scroll", () => updateEdgeFade(hourRail));

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (!location) {
    showError("Please enter a location");
    return;
  }
  await loadLocation(location);
  locationInput.value = "";
});

toggleTempBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  toggleTempBtn.textContent = isCelsius ? "°C" : "°F";
  if (currentWeatherData) render();
});

// ============================================
// INIT
// ============================================

toggleTempBtn.textContent = "°C";
loadLocation("Genoa");
