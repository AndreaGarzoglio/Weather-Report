import "./styles.css";

// ============================================
// CONFIGURATION & STATE
// ============================================

const API_KEY = 'PR2RC4B958BDS5Z6CAVEGHX86';
const API_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
let isCelsius = true;
let currentWeatherData = null;

// ============================================
// DOM ELEMENTS
// ============================================

const searchForm = document.getElementById("searchForm");
const locationInput = document.getElementById('locationInput');
const toggleTempBtn = document.getElementById('toggleTemp');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('errorMessage');
const currentWeatherSection = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const forecastGrid = document.getElementById('forecast');

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Fetches weather data from Visual Crossing API
async function fetchWeatherData(location) {
    const url = `${API_BASE_URL}/${encodeURIComponent(location)}?key=${API_KEY}&contentType=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API error');
    return response.json();
}

// Converts temperature between Fahrenheit and Celsius based on user preference
function convertTemp(fahrenheit) {
    return isCelsius ? Math.round(((fahrenheit - 32) * 5 / 9) * 10) / 10 : Math.round(fahrenheit);
}

// Converts wind speed between mph and kph based on user preference
function convertWindSpeed(mph) {
    return isCelsius ? Math.round(mph * 1.60934 * 10) / 10 : Math.round(mph);
}

// Returns appropriate weather emoji based on weather description
function getWeatherIcon(description) {
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('sunny')) return '☀️';
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('sleet')) return '🌨️';
    if (desc.includes('hail')) return '🧊';
    if (desc.includes('cloudy') || desc.includes('overcast')) return '☁️';
    if (desc.includes('cloud')) return '⛅';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    if (desc.includes('wind')) return '💨';
    return '🌡️';
}

// Updates background gradient based on weather conditions
function setBackgroundByWeather(description) {
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('sunny')) {
        document.body.style.background = 'linear-gradient(135deg, #5568D3 0%, #832da5 100%)';
    } else if (desc.includes('cloud')) {
        document.body.style.background = 'linear-gradient(135deg, #7f93d3 0%, #051f38 100%)';
    } else if (desc.includes('rain')) {
        document.body.style.background = 'linear-gradient(135deg, #2A3F5F 0%, #1E2D42 100%)';
    } else if (desc.includes('snow')) {
        document.body.style.background = 'linear-gradient(135deg, #E8EEF5 0%, #A8BACC 100%)';
    } else if (desc.includes('fog') || desc.includes('mist')) {
        document.body.style.background = 'linear-gradient(135deg, #7E8FA3 0%, #5F6F7E 100%)';
    } else if (desc.includes('storm') || desc.includes('thunder')) {
        document.body.style.background = 'linear-gradient(135deg, #1A2A3A 0%, #2B3E5F 100%)';
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

// Displays current weather conditions in the weather section
function displayCurrentWeather(data) {
    const current = data.currentConditions;
    const tempUnit = isCelsius ? '°C' : '°F';
    const windUnit = isCelsius ? 'kph' : 'mph';

    // Format today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const capitalizedAddress = data.resolvedAddress.charAt(0).toUpperCase() + data.resolvedAddress.slice(1);
    document.getElementById('location').innerHTML = `${capitalizedAddress}<br><span class="location-date">${formattedDate}</span>`;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(current.conditions);
    document.getElementById('temp').textContent = `${convertTemp(current.temp)}${tempUnit}`;
    document.getElementById('description').textContent = current.conditions;
    document.getElementById('feelsLike').textContent = `${convertTemp(current.feelslike)}${tempUnit}`;
    document.getElementById('humidity').textContent = `${current.humidity} %`;
    document.getElementById('windSpeed').textContent = `${convertWindSpeed(current.windspeed)} ${windUnit}`;

    setBackgroundByWeather(current.conditions);
    currentWeatherSection.classList.remove('hidden');
}

// Displays 7-day weather forecast as cards
function displayForecast(data) {
    forecastGrid.innerHTML = '';
    const tempUnit = isCelsius ? '°C' : '°F';

    data.days.slice(0, 7).forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="forecast-date">${new Date(day.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <p class="forecast-icon">${getWeatherIcon(day.conditions)}</p>
            <p class="forecast-description">${day.conditions}</p>
            <div class="forecast-temps">
                <span class="temp-max">${convertTemp(day.tempmax)}${tempUnit}</span>
                <span class="temp-min">${convertTemp(day.tempmin)}${tempUnit}</span>
            </div>
        `;
        forecastGrid.appendChild(card);
    });

    forecastSection.classList.remove('hidden');
}

// ============================================
// UI STATE FUNCTIONS
// ============================================

// Shows loading spinner and hides all content sections
function showLoading() {
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    currentWeatherSection.classList.add('hidden');
    forecastSection.classList.add('hidden');
}

// Hides loading spinner
function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// Displays error message and hides loading/weather sections
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    loadingDiv.classList.add('hidden');
    currentWeatherSection.classList.add('hidden');
    forecastSection.classList.add('hidden');
}

// ============================================
// EVENT LISTENERS
// ============================================

// Handles weather search form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (!location) {
        showError('Please enter a location');
        return;
    }
    showLoading();
    try {
        currentWeatherData = await fetchWeatherData(location);
        displayCurrentWeather(currentWeatherData);
        displayForecast(currentWeatherData);
        hideLoading();
        locationInput.value = '';
    } catch (error) {
        showError(`Could not find weather data for "${location}". Try another location.`);
    }
});

// Toggles temperature unit between Celsius and Fahrenheit
toggleTempBtn.addEventListener('click', () => {
    if (currentWeatherData) {
        isCelsius = !isCelsius;
        displayCurrentWeather(currentWeatherData);
        displayForecast(currentWeatherData);
    }
});

// ============================================
// INITIALIZATION
// ============================================

toggleTempBtn.textContent = '°C / °F';

// Loads default location weather on page load
window.addEventListener('load', async () => {
    try {
        currentWeatherData = await fetchWeatherData('Genoa');
        displayCurrentWeather(currentWeatherData);
        displayForecast(currentWeatherData);
    } catch (error) {
        console.log('Failed to load Genoa weather');
    }
});
