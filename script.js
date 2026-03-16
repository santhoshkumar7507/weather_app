const searchBtn = document.getElementById('searchBtn');
const homeBtn = document.getElementById('homeBtn');
const cityInput = document.getElementById('cityInput');
const weatherDetails = document.querySelector('.weather-details');
const notFound = document.querySelector('.not-found');
const watermark = document.getElementById('condition-watermark');
const thunderFlash = document.getElementById('thunder-flash');

// Initial state
homeBtn.style.display = 'none';

const tempElement = document.getElementById('temp');
const descElement = document.getElementById('desc');
const weatherIcon = document.getElementById('weatherIcon');

// Advanced Info Elements
const feelsLikeElement = document.getElementById('feelsLike');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const uvIndexElement = document.getElementById('uvIndex');
const visibilityElement = document.getElementById('visibility');
const pressureElement = document.getElementById('pressure');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const forecastGrid = document.getElementById('forecastGrid');

// Outstanding Interactive 3D Background Feature
const canvas = document.getElementById('weather-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let animationFrameId;
let thunderInterval;

let mouse = { x: null, y: null };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

const tiltBox = document.getElementById('tilt-box');

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
    if (tiltBox) tiltBox.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
});

window.addEventListener('mousemove', (e) => {
    if (!tiltBox) return;
    let x = e.clientX;
    let y = e.clientY;
    
    let boxRect = tiltBox.getBoundingClientRect();
    let boxCenterX = boxRect.left + boxRect.width / 2;
    let boxCenterY = boxRect.top + boxRect.height / 2;
    
    let rotateX = (boxCenterY - y) / 25;
    let rotateY = (x - boxCenterX) / 25;
    
    tiltBox.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 3 + 1; // Used for 3D depth perception & parallax
        
        if(effect === 'rain') {
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 1.5 + 1;
            this.speedY = Math.random() * 15 + 15;
            this.speedX = Math.random() * 1.5 - 0.5;
            this.color = 'rgba(255, 255, 255, 0.4)';
        } else if (effect === 'snow') {
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 2 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
        } else if (effect === 'fog') {
            this.size = Math.random() * 100 + 150;
            this.speedX = Math.random() * 0.4 + 0.1;
            this.speedY = Math.random() * 0.2 - 0.1;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.05 + 0.02})`;
        } else if (effect === 'clouds') {
            this.size = Math.random() * 200 + 400;
            this.speedX = Math.random() * 0.2 + 0.05;
            this.speedY = 0;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.08 + 0.03})`;
        } else {
            // "Network / Bokeh" advanced interactive background
            this.size = (Math.random() * 3 + 1);
            this.speedX = (Math.random() * 1 - 0.5) / this.z;
            this.speedY = (Math.random() * 1 - 0.5) / this.z;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
        }
    }
    
    update() {
        if (this.effect === 'rain' || this.effect === 'snow' || this.effect === 'fog' || this.effect === 'clouds') {
            this.y += this.speedY;
            this.x += this.speedX;
            // Interaction: slight push from mouse
            if ((this.effect === 'rain' || this.effect === 'snow') && mouse.x) {
                let dx = this.x - mouse.x;
                if (Math.abs(dx) < 100) this.x += dx * 0.02;
            }
            if (this.y > canvas.height + this.size) {
                this.y = 0 - this.size;
                if (this.effect !== 'clouds') this.x = Math.random() * canvas.width;
            }
            if (this.x > canvas.width + this.size) this.x = 0 - this.size;
            if (this.x < 0 - this.size) this.x = canvas.width + this.size;
        } else {
            // Interactive 3D Parallax Movement
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Rebound edges
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            // Deep Mouse Parallax
            if (mouse.x && mouse.y) {
                let pX = (window.innerWidth / 2 - mouse.x) * (0.005 / this.z);
                let pY = (window.innerHeight / 2 - mouse.y) * (0.005 / this.z);
                this.x += pX;
                this.y += pY;
            }
        }
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
    }
    
    draw() {
        ctx.beginPath();
        if(this.effect === 'rain') {
            ctx.rect(this.x, this.y, this.size, this.size * 12);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.effect === 'snow') {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.effect === 'fog' || this.effect === 'clouds') {
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw Interactive glowing node
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

function initParticles(effect) {
    particlesArray = [];
    let noOfParticles = 80; // Network
    if (effect === 'rain') noOfParticles = 450;
    if (effect === 'snow') noOfParticles = 300;
    if (effect === 'fog') noOfParticles = 30;
    if (effect === 'clouds') noOfParticles = 12;

    for (let i = 0; i < noOfParticles; i++) {
        particlesArray.push(new Particle(effect));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    
    // Draw 3D Network web if not raining/snowing
    if (particlesArray.length > 0 && particlesArray[0].effect === 'none') {
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i; j < particlesArray.length; j++) {
                let dx = particlesArray[i].x - particlesArray[j].x;
                let dy = particlesArray[i].y - particlesArray[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 110) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 - distance / 900})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Mouse lightning/connection
        if (mouse.x) {
            for (let i = 0; i < particlesArray.length; i++) {
                let dx = particlesArray[i].x - mouse.x;
                let dy = particlesArray[i].y - mouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 - distance / 600})`;
                    ctx.lineWidth = 1.5;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }
    
    animationFrameId = requestAnimationFrame(animateParticles);
}

function startEffect(effect) {
    cancelAnimationFrame(animationFrameId);
    clearInterval(thunderInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    thunderFlash.classList.remove('flash-animation');
    
    initParticles(effect);
    animateParticles();
    
    if (effect === 'thunder') {
        initParticles('rain'); 
        animateParticles();
        thunderInterval = setInterval(() => {
            if(Math.random() > 0.6) {
                thunderFlash.classList.remove('flash-animation');
                void thunderFlash.offsetWidth; 
                thunderFlash.classList.add('flash-animation');
            }
        }, 3000);
    }
}

function formatTime(isoString) {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDayName(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getWeatherIcon(code) {
    if (code === 0) return "fa-sun";
    if (code >= 1 && code <= 3) return "fa-cloud-sun";
    if (code === 45 || code === 48) return "fa-smog";
    if (code >= 51 && code <= 67) return "fa-cloud-rain";
    if (code >= 71 && code <= 77) return "fa-snowflake";
    if (code >= 80 && code <= 82) return "fa-cloud-showers-heavy";
    if (code >= 95 && code <= 99) return "fa-cloud-bolt";
    return "fa-cloud";
}

async function checkWeather(city) {
    if (city === '') return;

    try {
        weatherDetails.style.animation = 'none';
        void weatherDetails.offsetWidth; 

        // Geocoding: Try Open-Meteo first for fast global cities
        let latitude, longitude, name;
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
            latitude = geoData.results[0].latitude;
            longitude = geoData.results[0].longitude;
            name = geoData.results[0].name;
        } else {
            // Fallback: Use advanced OpenStreetMap (Nominatim) for deep local areas, towns, and specific streets
            const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
            const nomResponse = await fetch(nomUrl);
            const nomData = await nomResponse.json();
            
            if (nomData && nomData.length > 0) {
                latitude = parseFloat(nomData[0].lat);
                longitude = parseFloat(nomData[0].lon);
                // Keep the name short by grabbing the first part before the comma
                name = nomData[0].name || nomData[0].display_name.split(',')[0]; 
            } else {
                weatherDetails.style.display = 'none';
                notFound.style.display = 'block';
                document.body.className = '';
                startEffect('none');
                watermark.innerText = '404';
                homeBtn.style.display = 'flex';
                return;
            }
        }

        // Deep Weather Query
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&wind_speed_unit=kmh`;
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const current = weatherData.current;
        const daily = weatherData.daily;
        const code = current.weather_code;
        const isDay = current.is_day;
        const temp = current.temperature_2m;

        let weatherDesc = "Clear Sky";
        let shortForm = "CLEAR";
        let iconClass = isDay ? "fa-sun" : "fa-moon";
        let bodyClass = isDay ? "clear-day" : "clear-night";
        let effect = 'none'; // Defines interactive background

        if (temp >= 35) {
            bodyClass = "heat";
            shortForm = "HOT";
        }

        // Detailed mapping
        if (code === 0) {
            weatherDesc = isDay ? "Absolute Sunshine" : "Starlit Sky"; 
        } else if (code === 1 || code === 2 || code === 3) { 
            weatherDesc = "Moving Clouds"; 
            iconClass = isDay ? "fa-cloud-sun" : "fa-cloud-moon";
            bodyClass = "cloudy";
            effect = "clouds";
            shortForm = "CLOUDY";
        } else if (code === 45 || code === 48) { 
            weatherDesc = "Dense Fog"; 
            iconClass = "fa-smog"; 
            bodyClass = "fog";
            effect = "fog";
            shortForm = "FOG";
        } else if (code >= 51 && code <= 67) { 
            weatherDesc = "Heavy Rain"; 
            iconClass = "fa-cloud-rain"; 
            bodyClass = "rain";
            effect = "rain";
            shortForm = "RAIN";
        } else if (code >= 71 && code <= 77) { 
            weatherDesc = "Snowfall"; 
            iconClass = "fa-snowflake"; 
            bodyClass = "snow";
            effect = "snow";
            shortForm = "SNOW";
        } else if (code >= 80 && code <= 82) { 
            weatherDesc = "Rain Showers"; 
            iconClass = "fa-cloud-showers-heavy"; 
            bodyClass = "rain";
            effect = "rain";
            shortForm = "RAIN";
        } else if (code >= 95 && code <= 99) { 
            weatherDesc = "Severe Thunderstorm"; 
            iconClass = "fa-cloud-bolt"; 
            bodyClass = "thunder";
            effect = "thunder";
            shortForm = "STORM";
        }

        document.body.className = bodyClass;
        watermark.innerText = shortForm;
        startEffect(effect);

        // Update Text
        cityInput.value = name;
        tempElement.innerHTML = Math.round(temp);
        descElement.innerHTML = weatherDesc;
        
        feelsLikeElement.innerHTML = Math.round(current.apparent_temperature) + "°C";
        humidityElement.innerHTML = current.relative_humidity_2m + "%";
        windElement.innerHTML = current.wind_speed_10m + " km/h";
        pressureElement.innerHTML = Math.round(current.surface_pressure) + " hPa";
        visibilityElement.innerHTML = (current.visibility / 1000).toFixed(1) + " km";
        
        if (daily) {
            uvIndexElement.innerHTML = daily.uv_index_max ? daily.uv_index_max[0] : "0";
            sunriseElement.innerHTML = formatTime(daily.sunrise ? daily.sunrise[0] : null);
            sunsetElement.innerHTML = formatTime(daily.sunset ? daily.sunset[0] : null);

            // Populate Forecast
            forecastGrid.innerHTML = '';
            for (let i = 0; i < 7; i++) {
                const dayName = i === 0 ? "Today" : getDayName(daily.time[i]);
                const icon = getWeatherIcon(daily.weather_code[i]);
                const maxTemp = Math.round(daily.temperature_2m_max[i]);
                const minTemp = Math.round(daily.temperature_2m_min[i]);
                
                const forecastItem = `
                    <div class="forecast-item" style="animation: slideUp ${0.5 + i * 0.1}s ease forwards">
                        <span class="day">${dayName}</span>
                        <i class="fa-solid ${icon}"></i>
                        <span class="temp">${maxTemp}°<span style="opacity:0.6; font-size: 12px;">${minTemp}°</span></span>
                    </div>
                `;
                forecastGrid.innerHTML += forecastItem;
            }
        }

        weatherIcon.className = `fa-solid ${iconClass}`;
        
        notFound.style.display = 'none';
        homeBtn.style.display = 'flex';
        weatherDetails.style.display = 'block';
        weatherDetails.style.animation = 'slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

searchBtn.addEventListener('click', () => {
    checkWeather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkWeather(cityInput.value);
    }
});

homeBtn.addEventListener('click', () => {
    weatherDetails.style.display = 'none';
    notFound.style.display = 'none';
    homeBtn.style.display = 'none';
    cityInput.value = '';
    
    // Reset background to beautiful default
    document.body.className = '';
    watermark.innerText = 'WEATHER';
    startEffect('none');
});


