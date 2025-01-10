const apiKey = '';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const weatherGrid = document.getElementById('weather-grid');
    const locationBtn = document.getElementById('location-btn');
    const unitToggle = document.getElementById('unit-toggle');
    let isCelsius = true;

    // Search input event
    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 2) fetchWeatherData(searchInput.value);
    });

    // Location button event
    locationBtn.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByLocation(latitude, longitude);
        });
    });

    // Unit toggle event
    unitToggle.addEventListener('change', () => {
        isCelsius = !isCelsius;
        const city = document.getElementById('current-city').textContent;
        fetchWeatherData(city);
    });

    // Fetch weather by city name
    async function fetchWeatherData(city) {
        try {
            const units = isCelsius ? 'metric' : 'imperial';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`);
            const data = await response.json();
            displayCurrentWeather(data);
            fetchForecastData(city, units);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Fetch weather by geolocation
    async function fetchWeatherDataByLocation(lat, lon) {
        try {
            const units = isCelsius ? 'metric' : 'imperial';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`);
            const data = await response.json();
            displayCurrentWeather(data);
            fetchForecastData(data.name, units);
        } catch (error) {
            console.error('Error fetching weather data by location:', error);
        }
    }

    // Fetch 5-day forecast
    async function fetchForecastData(city, units) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`);
            const data = await response.json();
            displayForecast(data);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
        }
    }

    // Display current weather
    function displayCurrentWeather(weather) {
        document.getElementById('current-weather').innerHTML = `
            <h2 id="current-city">${weather.name}</h2>
            <p>Condition: ${weather.weather[0].description}</p>
            <p>Temperature: ${weather.main.temp} °${isCelsius ? 'C' : 'F'}</p>
            <p>Humidity: ${weather.main.humidity}%</p>
            <p>Wind Speed: ${weather.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
            <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" alt="Weather icon">
        `;
    }

    // Display 5-day forecast
    function displayForecast(forecast) {
        const forecastEl = document.getElementById('forecast');
        forecastEl.innerHTML = '<h3>5-Day Forecast</h3>';
        forecast.list.slice(0, 5).forEach(day => {
            forecastEl.innerHTML += `
                <div class="forecast-card">
                    <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <p>Temp: ${day.main.temp_min}° / ${day.main.temp_max}°</p>
                    <p>${day.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
                </div>
            `;
        });
    }
});
