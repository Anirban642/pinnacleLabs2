const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-text');
const tempTxt = document.querySelector('.temp-text');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-text');
const windValueTxt = document.querySelector('.wind-value-text');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItems = document.querySelectorAll('.forecast-item');

const apiKey = '3a50edae0bee99af2795499d3ba2c9c6';

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        updateForecastInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        updateForecastInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchdata(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return now.toLocaleDateString('en-US', options);
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchdata('weather', city);
    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + '°C';
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' m/s';
    conditionTxt.textContent = main;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    showDisplaySection(weatherInfoSection);
    console.log(weatherData);
    
}

async function updateForecastInfo(city) {
    const forecastData = await getFetchdata('forecast', city);
    if (forecastData.cod !== "200") {
        showDisplaySection(notFoundSection);
        return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const uniqueDates = [];
    const nextDaysData = forecastData.list.filter(item => {
        const date = item.dt_txt.split(' ')[0];
        if (date !== todayDate && !uniqueDates.includes(date) && uniqueDates.length < 4) {
            uniqueDates.push(date);
            return true;
        }
        return false;
    });

    nextDaysData.forEach((item, index) => {
        if (forecastItems[index]) {
            const dateElement = forecastItems[index].querySelector('.forecast-item-date');
            const imgElement = forecastItems[index].querySelector('.forecast-item-img');
            const tempElement = forecastItems[index].querySelector('.forecast-item-temp');

            const date = new Date(item.dt_txt);
            const options = { day: 'numeric', month: 'long' };
            const formattedDate = date.toLocaleDateString('en-US', options);

            dateElement.textContent = formattedDate;
            imgElement.src = `assets/weather/${getWeatherIcon(item.weather[0].id)}`;

            tempElement.textContent = Math.round(item.main.temp_max) + '°C';
        }
    });
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => sec.style.display = 'none');

    section.style.display = 'flex';
}
