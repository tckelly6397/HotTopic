const axios = require('axios');
const fs = require('fs');  // File system module to write data to JSON

const params = {
    latitude: 52.52,
    longitude: 13.41,
    start_date: "2014-10-18",
    end_date: "2024-10-16",
    daily: "temperature_2m_mean",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch"
};

const url = "https://archive-api.open-meteo.com/v1/archive";

// Helper function to create a time range
const range = (start, stop, step) =>
    Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);

(async () => {
    try {
        const response = await axios.get(url, { params });
        const data = response.data;

        // Timezone and location attributes
        const utcOffsetSeconds = data.utc_offset_seconds;
        const daily = data.daily;

        // Create the weather data structure for JSON output
        const weatherData = daily.time.map((t, index) => {
            const date = new Date((new Date(t).getTime() + utcOffsetSeconds * 1000));
            return {
                "mean temp": daily.temperature_2m_mean[index],  // Mean temperature
                "date": date.toISOString().split('T')[0],       // Only the date
                "time": date.toISOString().split('T')[1]         // Only the time
            };
        });

        // Write the JSON data to a file
        fs.writeFileSync('weather_data.json', JSON.stringify(weatherData, null, 2));

        console.log("Weather data has been written to weather_data.json");
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
})();


